import os
import shutil
import sys
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

# To import from the ML_model directory, we need to add the project root to the Python path.
# This makes the project structure more robust.
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Now we can import the processing function. The model will be loaded once when this module is imported.
from ML_model.fault_detection import process_video_file

# ================= Configuration =================
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
PROCESSED_FOLDER = os.path.join(os.path.dirname(__file__), 'processed')
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

# ================= Router Setup =================
video_router = APIRouter(
    prefix="/video",
    tags=["Video Processing"],
)

# ================= Helper Functions =================
def is_allowed_file(filename: str) -> bool:
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ================= Endpoints =================
# NOTE: This is defined with 'def', not 'async def'.
# This tells FastAPI to run it in a thread pool so the heavy GPU work doesn't block the main event loop.
@video_router.post("/upload")
def upload_video(file: UploadFile = File(...)):
    # 1. Validate extension
    if not is_allowed_file(file.filename):
        raise HTTPException(status_code=400, detail=f"File type not allowed. Use one of: {', '.join(ALLOWED_EXTENSIONS)}")

    # Clean filename to prevent directory traversal attacks
    safe_filename = os.path.basename(file.filename)
    input_path = os.path.join(UPLOAD_FOLDER, safe_filename)

    # 2. Save the uploaded file to disk efficiently
    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")
    finally:
        file.file.close()

    print(f"File received and saved to: {input_path}")

    # 3. Define output path
    processed_filename = f"processed_{safe_filename}"
    output_path = os.path.join(PROCESSED_FOLDER, processed_filename)

    # 4. Run the GPU processing logic (This is a blocking call)
    try:
        success, analytics_data = process_video_file(input_path, output_path)

        if success:
            # 5. Return JSON response with URL to the processed video
            return JSONResponse(content={
                'message': 'Processing complete successfully',
                'original_filename': safe_filename,
                'processed_filename': processed_filename,
                'download_url': f"/results/{processed_filename}",
                'analytics': analytics_data
            }, status_code=200)
        else:
            raise HTTPException(status_code=500, detail="Video processing failed. The video file might be corrupt or unreadable.")

    except Exception as e:
        print(f"An error occurred during video processing: {e}")
        # Clean up partial output file if a crash occurred
        if os.path.exists(output_path):
            os.remove(output_path)
        raise HTTPException(status_code=500, detail=f"An internal error occurred during processing: {e}")
    finally:
        # Clean up the original uploaded file to save space
        if os.path.exists(input_path):
            os.remove(input_path)
