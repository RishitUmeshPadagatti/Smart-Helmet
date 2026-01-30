# Helmet Detection Implementation Guide

## Overview

This document describes the YOLO-based helmet detection inference implementation in the Smart Helmet backend. The system uses a two-tier architecture:

- **Python**: Handles YOLO model inference
- **Node.js/Express.js**: Handles HTTP requests, file uploads, and response management

---

## Architecture

```
Client (Mobile App/Web)
    ↓
    ├─ HTTP POST /helmet-detect
    │
Express.js Server
    ├─ Validate request & file upload (multer)
    ├─ Save image to /uploads folder
    │
    ├─ Execute Python process (child_process)
    │
    ├─ Python Script (predict_helmet.py)
    │  ├─ Load YOLO model (helmet_best.pt)
    │  ├─ Run inference on image
    │  ├─ Extract detection results
    │  └─ Output JSON
    │
    ├─ Parse JSON response
    └─ Return structured response to client
```

---

## Components

### 1. Python Script: `ML_model/predict_helmet.py`

**Purpose**: Loads and runs YOLO inference on helmet detection.

**Features**:

- Loads YOLO model using Ultralytics library
- Runs inference with confidence threshold 0.25
- Extracts bounding boxes, classes, and confidence scores
- Categorizes detections as "helmet" or "no-helmet"
- Returns JSON output with complete detection details

**Usage**:

```bash
python ML_model/predict_helmet.py <image_path> <model_path>
```

**Output Format**:

```json
{
  "success": true,
  "image_path": "/path/to/image.jpg",
  "model_path": "/path/to/model.pt",
  "detected_classes": ["helmet", "no-helmet"],
  "detection_count": 2,
  "detections": [
    {
      "class": "helmet",
      "class_id": 0,
      "confidence": 0.95,
      "bbox": {
        "x1": 10,
        "y1": 20,
        "x2": 100,
        "y2": 150,
        "width": 90,
        "height": 130
      }
    }
  ],
  "summary": {
    "helmet_count": 1,
    "no_helmet_count": 1,
    "decision": "helmet"
  }
}
```

### 2. Express Route: `src/routes/helmet.js`

**Endpoints**:

#### POST `/helmet-detect/detect`

Upload an image and perform helmet detection.

**Request**:

- Method: `POST`
- Content-Type: `multipart/form-data`
- Field: `image` (file)
- Supported formats: JPG, JPEG, PNG, BMP, GIF
- Max size: 50MB

**Example with cURL**:

```bash
curl -X POST http://localhost:3000/helmet-detect/detect \
  -F "image=@/path/to/image.jpg"
```

**Example with JavaScript (Fetch API)**:

```javascript
const formData = new FormData();
formData.append("image", imageFile); // File object from input

const response = await fetch("/helmet-detect/detect", {
  method: "POST",
  body: formData,
});

const result = await response.json();
console.log(result);
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "image": {
    "filename": "helmet_1234567890-abc123.jpg",
    "path": "/uploads/helmet_1234567890-abc123.jpg",
    "size": 45678,
    "mimetype": "image/jpeg"
  },
  "detection": {
    "detected_classes": ["helmet", "no-helmet"],
    "detection_count": 2,
    "detections": [
      {
        "class": "helmet",
        "class_id": 0,
        "confidence": 0.95,
        "bbox": {
          "x1": 10,
          "y1": 20,
          "x2": 100,
          "y2": 150,
          "width": 90,
          "height": 130
        }
      }
    ],
    "summary": {
      "helmet_count": 1,
      "no_helmet_count": 1,
      "decision": "helmet"
    }
  },
  "timestamp": "2025-01-29T12:34:56.789Z"
}
```

**Error Response** (400/500):

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional context (development mode only)"
}
```

#### GET `/helmet-detect/health`

Health check for helmet detection service.

**Example**:

```bash
curl http://localhost:3000/helmet-detect/health
```

**Response**:

```json
{
  "service": "helmet-detection",
  "status": "ready",
  "components": {
    "model": {
      "exists": true,
      "path": "/.../ML_model/helmet_best.pt"
    },
    "script": {
      "exists": true,
      "path": "/.../ML_model/predict_helmet.py"
    }
  },
  "timestamp": "2025-01-29T12:34:56.789Z"
}
```

---

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd Backend-JS/ML_model
pip install -r requirements.txt
```

Ensure `requirements.txt` contains:

```
ultralytics
```

### 2. Verify Model File

Ensure the trained weights file exists:

```
Backend-JS/ML_model/helmet_best.pt
```

### 3. Verify Node Dependencies

The Express route uses `multer` which should already be in `package.json`:

```bash
cd Backend-JS
npm install
```

### 4. Start the Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Test the Service

```bash
# Health check
curl http://localhost:3000/helmet-detect/health

# Detect helmet in an image
curl -X POST http://localhost:3000/helmet-detect/detect \
  -F "image=@test_image.jpg"
```

---

## How It Works

### Request Flow

1. **File Upload**: Client sends image as `multipart/form-data`
2. **Multer Processing**: Express middleware validates and saves file to `/uploads`
3. **Spawn Python Process**: Node.js spawns Python process with `child_process.spawn()`
4. **YOLO Inference**: Python script loads model and runs detection
5. **JSON Output**: Python outputs JSON results to stdout
6. **Parse Results**: Node.js parses JSON from Python process
7. **Response**: Structured JSON response sent to client

### Confidence Threshold

- Default: 0.25 (can be adjusted in `predict_helmet.py`)
- Detections with lower confidence are filtered out

### Decision Logic

The `summary.decision` field is determined by:

1. **Priority 1**: If "helmet" class detected → `"helmet"`
2. **Priority 2**: If "no-helmet" class detected → `"no-helmet"`
3. **Default**: No detection → `"unknown"`

---

## Error Handling

### Common Issues

**Issue**: "Model not found"

- **Solution**: Verify `helmet_best.pt` exists in `ML_model/` directory

**Issue**: "Python not found"

- **Solution**: Ensure Python 3.8+ is installed and in PATH
  ```bash
  python --version
  ```

**Issue**: "Ultralytics module not found"

- **Solution**: Install dependencies
  ```bash
  pip install ultralytics
  ```

**Issue**: "Inference timed out"

- **Solution**: Increase timeout in `helmet.js` (currently 120 seconds)

**Issue**: "No detections found"

- **Solution**: Verify image quality and model compatibility

---

## Performance Optimization

### Memory Management

- Uploads are streamed (not buffered entirely in memory)
- Python process terminates after inference
- Temporary files stored in `/uploads`

### Speed Improvements

- YOLO inference runs sequentially (consider batch processing for multiple images)
- Use GPU acceleration if available (YOLO automatically detects CUDA)

### Cleanup

- Remove old images from `/uploads` periodically:
  ```bash
  find Backend-JS/uploads -mtime +7 -delete
  ```

---

## Integration with Mobile App

### React Native Example

```typescript
// SmartHelmetApp/services/helmetDetectionService.ts

export const detectHelmet = async (imageUri: string) => {
  const formData = new FormData();

  // Append image file
  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "helmet_detection.jpg",
  } as any);

  try {
    const response = await fetch(
      "http://your-backend:3000/helmet-detect/detect",
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      },
    );

    const result = await response.json();

    if (result.success) {
      return {
        helmetDetected: result.detection.summary.decision === "helmet",
        confidence: result.detection.detections[0]?.confidence || 0,
        detections: result.detection.detections,
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Helmet detection error:", error);
    throw error;
  }
};
```

---

## File Structure

```
Backend-JS/
├── ML_model/
│   ├── helmet_best.pt              # YOLO weights (trained model)
│   ├── predict_helmet.py           # Python inference script
│   └── requirements.txt            # Python dependencies
├── src/
│   └── routes/
│       ├── helmet.js               # Express route for helmet detection
│       └── index.js                # Routes index (updated)
└── uploads/                        # Temporary image storage
```

---

## Production Considerations

1. **Model Optimization**: Consider converting YOLO to ONNX for faster inference
2. **Caching**: Implement image caching for identical detections
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Logging**: Implement detailed logging for debugging
5. **Monitoring**: Set up alerts for inference failures
6. **Storage**: Implement automatic cleanup of old uploads
7. **Security**: Add authentication/authorization to API endpoints

---

## References

- **Ultralytics YOLO**: https://docs.ultralytics.com/
- **Multer Documentation**: https://github.com/expressjs/multer
- **Node.js Child Process**: https://nodejs.org/api/child_process.html

---

## Troubleshooting

For detailed debugging, enable development mode:

```bash
export NODE_ENV=development
npm run dev
```

Check logs for detailed error messages and stack traces.

---

**Last Updated**: January 29, 2025
**Version**: 1.0.0
