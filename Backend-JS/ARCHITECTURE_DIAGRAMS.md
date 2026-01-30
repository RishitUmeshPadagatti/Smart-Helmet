# Helmet Detection - Data Flow & Architecture Diagrams

## 1. Request/Response Flow

```
CLIENT APPLICATION
     │
     │ 1. Capture Image
     │ 2. Create FormData
     │ 3. POST to /helmet-detect/detect
     │
     ▼
NETWORK
     │
     │ multipart/form-data
     │ Content-Type: multipart/form-data
     │ Body: image file (binary)
     │
     ▼
EXPRESS.JS SERVER
     │
     ├─ 1. Receive request
     ├─ 2. Multer middleware processes file
     │  ├─ Validate file type
     │  ├─ Validate file size
     │  └─ Save to /uploads with UUID filename
     │
     ├─ 3. POST route handler
     │  └─ Check if file exists
     │
     ├─ 4. Spawn Python process
     │  ├─ Command: python predict_helmet.py <image> <model>
     │  └─ Set timeout: 120 seconds
     │
     └─ 5. Wait for Python output
        ├─ Capture stdout
        ├─ Capture stderr
        └─ Parse JSON
     │
     ▼
PYTHON PROCESS
     │
     ├─ 1. Load YOLO model (helmet_best.pt)
     │  └─ Using Ultralytics
     │
     ├─ 2. Load image from disk
     │
     ├─ 3. Run inference
     │  └─ Confidence threshold: 0.25
     │
     ├─ 4. Extract detections
     │  ├─ Classes
     │  ├─ Confidence scores
     │  ├─ Bounding boxes
     │  └─ Class IDs
     │
     ├─ 5. Process results
     │  ├─ Categorize helmets
     │  ├─ Count objects
     │  └─ Make decision
     │
     └─ 6. Output JSON to stdout
        └─ Single JSON object per line
     │
     ▼
BACK TO EXPRESS.JS
     │
     ├─ Parse JSON from Python
     ├─ Validate response structure
     ├─ Add image metadata
     ├─ Add timestamp
     ├─ Build response object
     │
     ▼
NETWORK
     │
     │ HTTP 200 OK
     │ Content-Type: application/json
     │
     ▼
CLIENT APPLICATION
     │
     ├─ 1. Receive response
     ├─ 2. Parse JSON
     ├─ 3. Check detection.summary.decision
     ├─ 4. Display result to user
     └─ 5. Take action (if helmet violation)
```

---

## 2. System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Mobile App   │  │ Web Browser  │  │ Desktop App  │         │
│  │ (React Native│  │ (React/Vue)  │  │ (Electron)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         └─────────────────┼──────────────────┘                 │
│                           │                                     │
│                      HTTP POST                                  │
│                    multipart/form-data                          │
│                      Image File                                 │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                   EXPRESS.JS LAYER                              │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ src/routes/helmet.js                                    │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ POST /helmet-detect/detect                              │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ 1. Multer Middleware                                    │   │
│  │    ├─ Storage Configuration                             │   │
│  │    ├─ File Filter (type validation)                     │   │
│  │    ├─ Size Limit (50MB)                                 │   │
│  │    └─ Unique Filename Generation                        │   │
│  │                                                          │   │
│  │ 2. Upload Handler                                       │   │
│  │    ├─ Check file exists                                 │   │
│  │    ├─ Validate model file                               │   │
│  │    └─ Log upload details                                │   │
│  │                                                          │   │
│  │ 3. Python Process Manager                               │   │
│  │    ├─ spawn('python', [...])                            │   │
│  │    ├─ stdout listener                                   │   │
│  │    ├─ stderr listener                                   │   │
│  │    ├─ close event handler                               │   │
│  │    ├─ error event handler                               │   │
│  │    └─ timeout protection                                │   │
│  │                                                          │   │
│  │ 4. Response Builder                                     │   │
│  │    ├─ Image metadata                                    │   │
│  │    ├─ Detection results                                 │   │
│  │    ├─ Summary data                                      │   │
│  │    ├─ Timestamp                                         │   │
│  │    └─ Error handling                                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                           │                                     │
│              GET /helmet-detect/health                         │
│              (Service status check)                            │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    PYTHON LAYER                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ML_model/predict_helmet.py                              │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ Main Components:                                        │   │
│  │                                                          │   │
│  │ 1. Argument Parser                                      │   │
│  │    ├─ Image path                                        │   │
│  │    └─ Model path                                        │   │
│  │                                                          │   │
│  │ 2. File Validation                                      │   │
│  │    ├─ Check image exists                                │   │
│  │    └─ Check model exists                                │   │
│  │                                                          │   │
│  │ 3. YOLO Model Loading                                  │   │
│  │    └─ from ultralytics import YOLO                      │   │
│  │       YOLO(model_path)                                  │   │
│  │                                                          │   │
│  │ 4. Inference Engine                                     │   │
│  │    ├─ model.predict(source=image, conf=0.25)           │   │
│  │    └─ Returns detection results                         │   │
│  │                                                          │   │
│  │ 5. Result Processing                                    │   │
│  │    ├─ Extract boxes                                     │   │
│  │    ├─ Extract confidence                                │   │
│  │    ├─ Extract class IDs                                 │   │
│  │    ├─ Get class names                                   │   │
│  │    ├─ Calculate bounding boxes                          │   │
│  │    └─ Categorize helmet/no-helmet                       │   │
│  │                                                          │   │
│  │ 6. Decision Logic                                       │   │
│  │    ├─ Count helmets                                     │   │
│  │    ├─ Count no-helmets                                  │   │
│  │    └─ Make decision (helmet/no-helmet/unknown)          │   │
│  │                                                          │   │
│  │ 7. JSON Output                                          │   │
│  │    └─ print(json.dumps(response))                       │   │
│  │       → stdout → captured by Node.js                    │   │
│  └────────────────────────────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Model & Data                                            │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ helmet_best.pt  (YOLO weights)                          │   │
│  │ - 11.2M file size                                       │   │
│  │ - Trained on helmet detection dataset                   │   │
│  │ - 2 classes: helmet, no-helmet                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                    FILE SYSTEM                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ Backend-JS/                                             │   │
│  │ ├── uploads/                                            │   │
│  │ │   ├── helmet_1704067200000-abc123.jpg (temp)         │   │
│  │ │   └── helmet_1704067210000-def456.jpg (temp)         │   │
│  │ ├── ML_model/                                           │   │
│  │ │   ├── helmet_best.pt (model file)                    │   │
│  │ │   └── predict_helmet.py (inference script)           │   │
│  │ └── src/                                                │   │
│  │     └── routes/                                         │   │
│  │         ├── helmet.js (API route)                      │   │
│  │         └── index.js (router config)                   │   │
│  └────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Request/Response Data Structure

### REQUEST

```
POST /helmet-detect/detect HTTP/1.1
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="image"; filename="photo.jpg"
Content-Type: image/jpeg

[BINARY IMAGE DATA]
------FormBoundary--
```

### RESPONSE (Success)

```json
{
  "success": true,
  "image": {
    "filename": "helmet_1704067200000-abc123.jpg",
    "path": "/uploads/helmet_1704067200000-abc123.jpg",
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
          "x1": 100,
          "y1": 150,
          "x2": 300,
          "y2": 450,
          "width": 200,
          "height": 300
        }
      },
      {
        "class": "no-helmet",
        "class_id": 1,
        "confidence": 0.87,
        "bbox": {
          "x1": 400,
          "y1": 200,
          "x2": 550,
          "y2": 480,
          "width": 150,
          "height": 280
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

---

## 4. Process Communication

```
Express.js                      Python Process
    │                               │
    ├──── spawn('python', [...]) ──→│
    │                               │
    │                    (Loading model...)
    │                               │
    │                    (Running inference...)
    │                               │
    │                    (Processing results...)
    │                               │
    │← stdout: {"success": true, ...}
    │                               │
    │← stdout: (end of data)         │
    │                               │
    │← close event (exit code 0)    │
    │                               │
    └─ Parse JSON                  │
    └─ Validate structure          │
    └─ Build response              │
    └─ Send HTTP 200               │
```

---

## 5. Decision Logic Flow

```
INPUT: Image File
    │
    ▼
YOLO Inference
    │
    ├─→ Box 1: "helmet", confidence: 0.95
    ├─→ Box 2: "helmet", confidence: 0.92
    ├─→ Box 3: "no-helmet", confidence: 0.88
    │
    ▼
Count Results
    ├─ helmet_count = 2
    ├─ no_helmet_count = 1
    │
    ▼
Decision Logic
    │
    ├─ If helmet_count > 0
    │  └─ decision = "helmet"
    │
    ├─ Else if no_helmet_count > 0
    │  └─ decision = "no-helmet"
    │
    └─ Else
       └─ decision = "unknown"
    │
    ▼
OUTPUT: decision = "helmet"
```

---

## 6. Error Handling Flow

```
REQUEST RECEIVED
    │
    ├─→ File exists?
    │   ├─ No → HTTP 400: "No file uploaded"
    │   └─ Yes → Continue
    │
    ├─→ File type valid? (jpg, png, bmp, gif)
    │   ├─ No → HTTP 400: "File type not allowed"
    │   └─ Yes → Continue
    │
    ├─→ File size OK? (< 50MB)
    │   ├─ No → HTTP 413: "File too large"
    │   └─ Yes → Continue
    │
    ├─→ Model file exists?
    │   ├─ No → HTTP 500: "YOLO model not found"
    │   └─ Yes → Continue
    │
    ├─→ Spawn Python process
    │   ├─ Error → HTTP 500: "Failed to start Python"
    │   └─ Success → Continue
    │
    ├─→ Python execution
    │   ├─ Timeout (120s) → HTTP 500: "Inference timeout"
    │   ├─ Exit code ≠ 0 → HTTP 400: "Inference failed"
    │   └─ Exit code = 0 → Continue
    │
    ├─→ Parse JSON
    │   ├─ Invalid JSON → HTTP 500: "Parse error"
    │   └─ Valid JSON → Continue
    │
    ├─→ Validate structure
    │   ├─ Invalid → HTTP 500: "Invalid response structure"
    │   └─ Valid → Continue
    │
    └─→ HTTP 200: Return detection results
```

---

## 7. Performance Timeline (typical)

```
T+0ms    → HTTP request received
T+10ms   → File validation complete
T+15ms   → File saved to /uploads
T+20ms   → Python process spawned
T+100ms  → Model loaded (first time)
          or
T+50ms   → Model loaded (cached)
T+150ms  → Inference complete
T+200ms  → Results processed
T+210ms  → JSON parsed
T+220ms  → HTTP 200 response sent

Total time: ~200-300ms per image
(includes file I/O, network, Python startup)

Factors affecting speed:
- Image size and complexity
- Model loading time (first vs cached)
- System resources (CPU, RAM)
- Python startup overhead
- Network latency
```

---

## 8. Sequence Diagram

```
Client              Node.js              Python          Disk
  │                   │                   │              │
  │ POST /detect      │                   │              │
  ├────────────────→  │                   │              │
  │ (image file)      │                   │              │
  │                   │ ▶ validate        │              │
  │                   │ ▶ save file       ├──────────────→ │
  │                   │                   │              │
  │                   │ ▶ spawn python    │              │
  │                   │ ▶ pass args       │              │
  │                   ├────────────────→  │              │
  │                   │                   │              │
  │                   │                   │ load model   │
  │                   │                   ├──────────────→ │
  │                   │                   │ read file    │
  │                   │                   │← ─ ─ ─ ─ ─ ─│
  │                   │                   │              │
  │                   │                   │ load image   │
  │                   │                   ├──────────────→ │
  │                   │                   │ read file    │
  │                   │                   │← ─ ─ ─ ─ ─ ─│
  │                   │                   │              │
  │                   │                   │ run inference│
  │                   │                   │              │
  │                   │ ◀ capture stdout  │              │
  │                   │◀─────────────────┤              │
  │                   │  JSON results     │              │
  │                   │                   │              │
  │                   │ ◀ close event     │              │
  │                   │◀─────────────────┤              │
  │                   │                   │              │
  │                   │ parse & validate  │              │
  │                   │ build response    │              │
  │                   │                   │              │
  │ HTTP 200 + JSON   │                   │              │
  │ ◀────────────────┤                    │              │
  │                   │                   │              │
  ▼                   ▼                   ▼              ▼
```

---

## 9. File System Structure

```
Backend-JS/
│
├── ML_model/
│   ├── helmet_best.pt                  ← YOLO model (11.2MB)
│   ├── predict_helmet.py               ← Python inference script
│   ├── requirements.txt                ← Python dependencies
│   ├── yolov8s.pt                      ← Alternative model
│   └── ... (other files)
│
├── src/
│   ├── server.js                       ← Main Express server
│   ├── routes/
│   │   ├── helmet.js                   ← NEW: Helmet detection route
│   │   ├── index.js                    ← UPDATED: Router config
│   │   ├── users.js
│   │   ├── sensors.js
│   │   └── video.js
│   ├── middleware/
│   ├── models/
│   └── utils/
│
├── uploads/                            ← Temporary image storage
│   ├── helmet_1704067200000-abc.jpg
│   ├── helmet_1704067210000-def.jpg
│   └── ... (cleaned up periodically)
│
├── package.json                        ← Node dependencies
├── HELMET_DETECTION.md                 ← API documentation
├── HELMET_DETECTION_SETUP.md           ← Setup guide
├── HELMET_DETECTION_QUICK_REFERENCE.js ← Quick reference
├── EXAMPLES.js                         ← Code examples
├── VERIFICATION_CHECKLIST.md           ← Testing guide
├── test_helmet_detection.sh            ← Test script (Unix)
├── test_helmet_detection.bat           ← Test script (Windows)
├── IMPLEMENTATION_SUMMARY.md           ← This summary
└── ... (other files)
```

---

## Summary

These diagrams show:

1. **Complete request/response cycle** from client to server to Python and back
2. **System architecture** with all layers and components
3. **Data structures** for requests and responses
4. **Process communication** between Node.js and Python
5. **Decision logic** for helmet detection
6. **Error handling** at each step
7. **Performance timeline** for typical requests
8. **Sequence diagram** showing interactions
9. **File system structure** for all new and modified files

This comprehensive visualization helps understand how the helmet detection system works end-to-end.
