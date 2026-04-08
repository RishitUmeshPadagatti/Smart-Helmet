import cv2
import base64
import sys
import time

try:
    # 0 is usually the built-in webcam on Mac
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Could not open webcam", file=sys.stderr)
        sys.exit(1)

    # Set lower resolution to make streaming smoother
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    while True:
        ret, frame = cap.read()
        if not ret:
            time.sleep(0.1)
            continue
        
        # Encode frame as JPEG
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 60])
        if ret:
            b64 = base64.b64encode(buffer).decode('utf-8')
            # If running directly in a terminal, print status instead of flooding the screen
            if sys.stdout.isatty():
                print(f"[{time.strftime('%H:%M:%S')}] Camera active: Captured frame...", end='\r')
            else:
                # If spawned by Node.js, send the base64 string
                print(b64)
                
            sys.stdout.flush()
        
        # Limit frame rate to ~20FPS so we don't overwhelm the network
        time.sleep(0.05)
except Exception as e:
    print(f"Exception in Python webcam script: {e}", file=sys.stderr)
finally:
    if 'cap' in locals() and cap.isOpened():
        cap.release()
