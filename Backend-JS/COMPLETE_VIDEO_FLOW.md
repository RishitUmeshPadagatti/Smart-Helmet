# Complete Video Upload & Analysis Flow

## 📹 Step-by-Step Walkthrough

Here's **exactly what happens** when a video is uploaded:

---

## STEP 1️⃣: Frontend Uploads Video

### What Happens

```javascript
// Frontend sends video to backend
const formData = new FormData();
formData.append("video", videoFile); // Multipart form data

fetch("/api/video-analysis", {
  method: "POST",
  body: formData,
});
```

### Backend Receives

- Video file arrives at `POST /api/video-analysis`
- Multer validates:
  - ✅ File exists
  - ✅ Format supported (MP4, AVI, MOV, MKV, WEBM, FLV, WMV)
  - ✅ File size < 500MB
- File saved to: `uploads/videos/analysis_[timestamp]-[uuid].mp4`
- Video ID (UUID) generated: `f47ac10b-58cc-4372-a567-0e02b2c3d479`

### Code Location

📄 [src/routes/videoAnalysis.js](src/routes/videoAnalysis.js#L130-L160)

```javascript
router.post("/video-analysis", upload.single("video"), async (req, res) => {
  const videoId = uuidv4(); // Generate unique ID
  const videoPath = uploadedFile.path; // File path
  const outputDir = path.join(OUTPUTS_DIR, videoId); // Create output folder
  // ... continue with analysis
});
```

---

## STEP 2️⃣: ML Service Runs (Helmet + Vehicle + Garbage)

### What Python Service Does

The `dual_model_ml_service.py` is spawned:

```python
python dual_model_ml_service.py \
  /path/to/video.mp4 \
  /path/to/output/directory
```

### Analysis #1: HELMET DETECTION ⛑️

```
Video frames processed → YOLO model → Person detected → No helmet?
├─ Helmet present? ✅ Skip
├─ Helmet missing? ❌ VIOLATION DETECTED
│   └─ Store: frame number, confidence, bbox coordinates
└─ Repeat for every frame
```

**Output Format**:

```json
{
  "violations": {
    "helmet": {
      "count": 5,
      "details": [
        {
          "frame_number": 100,
          "confidence": 0.95,
          "bbox": [10, 20, 100, 150]
        },
        {
          "frame_number": 250,
          "confidence": 0.88,
          "bbox": [500, 100, 600, 350]
        }
      ]
    }
  }
}
```

### Analysis #2: VEHICLE THREAT DETECTION 🚗

```
Video frames processed → YOLO model → Vehicle detected?
├─ Vehicle type: car / motorcycle / bus / truck
├─ Calculate threat score (0-100)
│   ├─ Position in frame
│   ├─ Distance from center
│   ├─ Looming behavior
│   └─ Speed estimation
└─ Store: frame, vehicle type, threat score
```

**Output Format**:

```json
{
  "violations": {
    "vehicle": {
      "count": 2,
      "details": [
        {
          "frame_number": 150,
          "vehicle_type": "car",
          "threat_score": 75,
          "threat_level": "medium",
          "bbox": [50, 200, 800, 500],
          "confidence": 0.92
        }
      ]
    }
  }
}
```

### Analysis #3: GARBAGE DETECTION 🗑️

```
Video frames processed → TensorFlow model → Each frame classified
├─ Frame contains garbage? YES
│   ├─ Confidence: 0.87
│   ├─ Store frame for annotation
│   └─ Keep best frame (highest confidence)
├─ Frame is clean? NO
│   └─ Skip
└─ Return: best garbage frame found in entire video
```

**Output Format**:

```json
{
  "garbage_detected": true,
  "best_garbage_frame_number": 300,
  "best_garbage_confidence": 0.87,
  "best_garbage_frame": [binary image data]
}
```

### Creates OUTPUT FILES 📁

**Directory Structure Created**:

```
outputs/
└── f47ac10b-58cc-4372-a567-0e02b2c3d479/  (video_id directory)
    ├── annotated_violations.mp4            ← Full video with boxes drawn
    ├── analysis.json                       ← Complete analysis data
    └── violation_frames/
        ├── 0001.jpg (frame 100)
        ├── 0002.jpg (frame 250)
        ├── 0003.jpg (frame 150)
        └── ...

outputs/garbage/
└── f47ac10b-58cc-4372-a567-0e02b2c3d479_best.jpg  ← Best garbage frame
```

### Code Location

📄 [src/routes/videoAnalysis.js](src/routes/videoAnalysis.js#L360-L410)

```javascript
const mlResults = await runMLService(videoPath, outputDir);
// mlResults contains:
// {
//   success: true,
//   violations: { helmet: {...}, vehicle: {...} },
//   garbage_detected: true,
//   best_garbage_frame_number: 300,
//   best_garbage_confidence: 0.87,
//   video_info: { duration, fps, resolution, total_frames }
// }
```

---

## STEP 3️⃣: OCR Service Runs (License Plate Extraction)

### What Python Service Does

The `easyocr_plate_extractor.py` is spawned:

```python
python easyocr_plate_extractor.py \
  /path/to/violation_frames/
```

### Process

```
Violation frames from Step 2 → EasyOCR model → Extract text
├─ Read frame 1: Extract "MH14GE9533"
├─ Read frame 2: Extract "MH14GE9532"
├─ Read frame 3: Extract "MH14GE9533"
├─ Read frame 4: Extract "MH14GE9533"
├─ Read frame 5: Extract "MH14GE9533"
└─ Vote on results:
    ├─ "MH14GE9533" got 8 votes → PRIMARY PLATE ✅
    └─ "MH14GE9532" got 2 votes → SECONDARY PLATE
```

**Output Format**:

```json
{
  "success": true,
  "plates": {
    "primary": "MH14GE9533",
    "primary_votes": 8,
    "primary_confidence": 0.92,
    "secondary": "MH14GE9532",
    "secondary_votes": 2,
    "secondary_confidence": 0.65,
    "extraction_confidence": 0.92,
    "total_frames": 12,
    "successful_extractions": 11
  }
}
```

### Code Location

📄 [src/routes/videoAnalysis.js](src/routes/videoAnalysis.js#L180-L195)

```javascript
const ocrResults = await runOCRService(violationFramesDir);
// ocrResults contains:
// {
//   success: true,
//   plates: { primary, primary_votes, secondary, ... },
//   total_frames: 12
// }
```

---

## STEP 4️⃣: Compile Complete Response

### What Node.js Does

Takes results from BOTH services and creates ONE comprehensive JSON:

```javascript
const analysisResponse = {
  success: true,
  video_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",

  video: {
    filename: "analysis_123-xxx.mp4",
    upload_path: "/uploads/videos/analysis_123-xxx.mp4",
    size: 125500000, // bytes
    duration: 30.5, // seconds
    fps: 25,
    resolution: "1920x1080",
  },

  analysis: {
    // HELMET VIOLATIONS
    helmet_violations: [
      {
        frame_number: 100,
        confidence: 0.95,
        bbox: [10, 20, 100, 150],
      },
      {
        frame_number: 250,
        confidence: 0.88,
        bbox: [500, 100, 600, 350],
      },
    ],

    // VEHICLE THREATS
    vehicle_threats: [
      {
        frame_number: 150,
        vehicle_type: "car",
        threat_score: 75,
        threat_level: "medium",
        bbox: [50, 200, 800, 500],
        confidence: 0.92,
      },
    ],

    // GARBAGE DETECTION
    garbage_detection: {
      detected: true,
      best_frame_path:
        "/outputs/garbage/f47ac10b-58cc-4372-a567-0e02b2c3d479_best.jpg",
      confidence: 0.87,
      frame_number: 300,
    },

    // LICENSE PLATES
    license_plates: {
      primary: "MH14GE9533",
      primary_votes: 8,
      secondary: "MH14GE9532",
      secondary_votes: 2,
      extraction_confidence: 0.92,
      frames_analyzed: 12,
    },
  },

  output: {
    // ANNOTATED VIDEO (with all boxes drawn)
    annotated_video:
      "/outputs/f47ac10b-58cc-4372-a567-0e02b2c3d479/annotated_violations.mp4",

    // VIOLATION FRAMES (individual JPG images)
    violation_frames:
      "/outputs/f47ac10b-58cc-4372-a567-0e02b2c3d479/violation_frames/",

    // GARBAGE FRAME (best frame with garbage)
    garbage_frames: "/outputs/garbage/",

    // ANALYSIS FILE (all data in JSON)
    analytics_file:
      "/outputs/f47ac10b-58cc-4372-a567-0e02b2c3d479/analysis.json",
  },

  statistics: {
    total_frames: 750,
    violation_frames_count: 5,
    processing_time_seconds: 45.23,
    frames_per_second: 16.6,
  },

  timestamp: "2026-01-30T15:30:45.123Z",
};
```

### Code Location

📄 [src/routes/videoAnalysis.js](src/routes/videoAnalysis.js#L220-L270)

---

## 🎯 ROUTE 1: POST /api/video-analysis

### What It Returns

**Response When Violations Found**:

```json
{
  "success": true,
  "video_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "analysis": {
    "helmet_violations": [
      { "frame_number": 100, "confidence": 0.95, ... },
      { "frame_number": 250, "confidence": 0.88, ... }
    ],
    "vehicle_threats": [
      { "frame_number": 150, "threat_score": 75, ... }
    ],
    "garbage_detection": {
      "detected": true,
      "best_frame_path": "/outputs/garbage/f47ac10b_best.jpg",
      "confidence": 0.87
    },
    "license_plates": {
      "primary": "MH14GE9533",
      "primary_votes": 8
    }
  },
  "output": {
    "annotated_video": "/outputs/f47ac10b/annotated_violations.mp4",
    "violation_frames": "/outputs/f47ac10b/violation_frames/",
    "garbage_frames": "/outputs/garbage/",
    "analytics_file": "/outputs/f47ac10b/analysis.json"
  },
  "statistics": {
    "total_frames": 750,
    "violation_frames_count": 5,
    "processing_time_seconds": 45.23
  }
}
```

### What Files Are Available

1. **Annotated Video** ✅
   - Path: `/outputs/f47ac10b/annotated_violations.mp4`
   - Contains: All boxes drawn for helmet violations, vehicle threats, plates
   - Quality: Same as input video
   - Size: 50-100MB

2. **Violation Frames** ✅
   - Path: `/outputs/f47ac10b/violation_frames/`
   - Contains: JPG images of each violation frame
   - Example: `0001.jpg`, `0002.jpg`, etc.
   - Size: 500KB-2MB each

3. **Garbage Frame** ✅
   - Path: `/outputs/garbage/f47ac10b_best.jpg`
   - Contains: Single best frame with garbage detected
   - Quality: Best frame from entire video
   - Size: 5-10MB

4. **Analysis JSON** ✅
   - Path: `/outputs/f47ac10b/analysis.json`
   - Contains: Complete analysis data (same as API response)
   - Size: 10-50KB

### How Frontend Uses This

```javascript
// Upload video
const response = await fetch("/api/video-analysis", {
  method: "POST",
  body: formData,
});

const result = await response.json();

// Check for violations
console.log(`Helmet violations: ${result.analysis.helmet_violations.length}`);
console.log(`License plate: ${result.analysis.license_plates.primary}`);
console.log(`Garbage detected: ${result.analysis.garbage_detection.detected}`);

// Get file paths
const videoPath = result.output.annotated_video;
const garbagePath = result.analysis.garbage_detection.best_frame_path;

// Display annotated video
document.getElementById("video").src = videoPath;

// Display garbage frame
if (result.analysis.garbage_detection.detected) {
  document.getElementById("garbageImage").src = garbagePath;
}
```

---

## 🗑️ ROUTE 2: POST /api/garbage-analysis

### What It Does

**Optional second call** for detailed garbage information:

```javascript
// First call (video analysis)
const analysisResponse = await fetch('/api/video-analysis', { ... });
const video_id = analysisResponse.video_id;

// Second call (garbage details) - OPTIONAL
const garbageResponse = await fetch('/api/garbage-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ video_id })
});

const garbageDetails = await garbageResponse.json();
```

### Response When Garbage Detected

```json
{
  "success": true,
  "video_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "garbage_analysis": {
    "detected": true,
    "best_frame_path": "/outputs/garbage/f47ac10b-58cc-4372-a567-0e02b2c3d479_best.jpg",
    "confidence": 0.87,
    "recommendation": "Garbage detected with high confidence. Immediate action recommended."
  },
  "timestamp": "2026-01-30T15:35:20.456Z"
}
```

### Response When No Garbage

```json
{
  "success": true,
  "video_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "garbage_analysis": {
    "detected": false,
    "best_frame_path": null,
    "confidence": 0,
    "recommendation": "No garbage detected in the video."
  },
  "timestamp": "2026-01-30T15:35:20.456Z"
}
```

### How It Works Internally

```javascript
// Read stored analysis file
const analysisFile = `/outputs/f47ac10b/analysis.json`;
const analysisData = JSON.parse(fs.readFile(analysisFile));

// Extract garbage confidence
const confidence = analysisData.analysis.garbage_detection.confidence;

// Generate recommendation based on confidence
if (confidence > 0.8) {
  recommendation =
    "Garbage detected with high confidence. Immediate action recommended.";
} else if (confidence > 0.6) {
  recommendation = `Garbage detected (${(confidence * 100).toFixed(1)}% confidence). Review recommended.`;
} else {
  recommendation = `Possible garbage (${(confidence * 100).toFixed(1)}% confidence). Further inspection suggested.`;
}

// Return response
return {
  detected: true,
  best_frame_path: "/outputs/garbage/f47ac10b_best.jpg",
  confidence: 0.87,
  recommendation,
};
```

### Code Location

📄 [src/routes/videoAnalysis.js](src/routes/videoAnalysis.js#L280-L345)

### Use Case

When frontend wants **more details about garbage** without re-analyzing:

- Look up video by ID
- Get detailed garbage confidence
- Get AI-generated recommendation
- Show garbage frame to user

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend Uploads Video                                   │
│    POST /api/video-analysis (multipart/form-data)          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend Receives & Validates                             │
│    • Check file exists                                      │
│    • Check format (MP4, AVI, MOV, etc.)                    │
│    • Check size < 500MB                                    │
│    • Generate video_id (UUID)                              │
│    • Save to: uploads/videos/analysis_[uuid].mp4          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Run ML Service (dual_model_ml_service.py)                │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Analysis #1: HELMET DETECTION (YOLO)               │   │
│  │ • Scan all frames                                   │   │
│  │ • Detect people without helmets                    │   │
│  │ • Store frame #, confidence, bbox coordinates      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Analysis #2: VEHICLE THREAT DETECTION (YOLO)       │   │
│  │ • Detect vehicles in frame                          │   │
│  │ • Calculate threat score (0-100)                    │   │
│  │ • Store vehicle type, threat level                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Analysis #3: GARBAGE DETECTION (TensorFlow)        │   │
│  │ • Classify each frame: garbage or clean            │   │
│  │ • Find best frame (highest confidence)             │   │
│  │ • Save best garbage frame                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│ CREATES:                                                     │
│ • outputs/{video_id}/annotated_violations.mp4              │
│ • outputs/{video_id}/violation_frames/[0001.jpg, ...]      │
│ • outputs/garbage/{video_id}_best.jpg                      │
│ • outputs/{video_id}/analysis.json                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Run OCR Service (easyocr_plate_extractor.py)             │
│                                                              │
│  • Read violation frames from Step 3                        │
│  • Extract license plate text using EasyOCR                │
│  • Vote on results (most common plate = primary)           │
│  • Return: primary plate, secondary plate, confidence      │
│                                                              │
│  Example voting:                                            │
│  • Frame 1: "MH14GE9533" ✅                                │
│  • Frame 2: "MH14GE9532"                                   │
│  • Frame 3: "MH14GE9533" ✅                                │
│  • Frame 4: "MH14GE9533" ✅                                │
│  └─ Primary: "MH14GE9533" (3 votes)                        │
│     Secondary: "MH14GE9532" (1 vote)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Compile Response (Node.js)                               │
│                                                              │
│ Merge results from ML + OCR services into:                 │
│ {                                                           │
│   video_id: "...",                                          │
│   analysis: {                                               │
│     helmet_violations: [...],        ← From ML             │
│     vehicle_threats: [...],          ← From ML             │
│     garbage_detection: {...},        ← From ML             │
│     license_plates: {...}            ← From OCR            │
│   },                                                        │
│   output: {                                                 │
│     annotated_video: "...",                                │
│     violation_frames: "...",                               │
│     garbage_frames: "...",                                 │
│     analytics_file: "..."                                  │
│   },                                                        │
│   statistics: { ... }                                       │
│ }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ 6. Return JSON Response│
        │    (ROUTE 1)           │
        │  POST /api/video-      │
        │      analysis          │
        └────────────┬───────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
    ┌─────────────────┐   ┌──────────────────┐
    │ Frontend Shows  │   │ Frontend Can Call│
    │ • Violations    │   │ POST /api/       │
    │ • Plate         │   │ garbage-analysis │
    │ • Video         │   │ (ROUTE 2)        │
    │ • Garbage       │   │ for details      │
    └─────────────────┘   └──────────────────┘
```

---

## 🔄 Two Routes Explained

### Route 1: POST /api/video-analysis (MAIN)

**Purpose**: Upload video, get EVERYTHING

```
Request:
├─ Method: POST
├─ Endpoint: /api/video-analysis
├─ Content-Type: multipart/form-data
└─ Body: video file

Response (SUCCESS):
├─ All helmet violations
├─ All vehicle threats
├─ Garbage detection status + best frame path
├─ License plates (primary + secondary)
├─ Paths to annotated video
├─ Paths to violation frames
├─ Paths to garbage frame
└─ Processing statistics
```

**What You Get Back**:

- ✅ Helmet violations array
- ✅ Vehicle threats array
- ✅ Garbage detected (true/false) + best frame path
- ✅ License plate text
- ✅ Path to annotated video
- ✅ Path to garbage image
- ✅ Video ID for future reference

---

### Route 2: POST /api/garbage-analysis (OPTIONAL)

**Purpose**: Get detailed garbage analysis using video_id

```
Request:
├─ Method: POST
├─ Endpoint: /api/garbage-analysis
├─ Content-Type: application/json
└─ Body: { "video_id": "f47ac10b-..." }

Response:
├─ Garbage detected (true/false)
├─ Best frame path
├─ Confidence score
└─ AI recommendation ("High confidence. Immediate action required.")
```

**When to Use**:

- User clicks "Details" for garbage information
- Want to show AI-generated recommendation
- Need to fetch specific garbage confidence
- Show only garbage-related info

**Example Flow**:

```javascript
// Step 1: Upload and analyze
const step1 = await fetch("/api/video-analysis", { body: videoFile });
const result = await step1.json();
const video_id = result.video_id;

// Step 2: User clicks "Show Garbage Details"
const step2 = await fetch("/api/garbage-analysis", {
  method: "POST",
  body: JSON.stringify({ video_id }),
});
const garbageDetails = await step2.json();

// Show detailed garbage analysis
console.log(garbageDetails.garbage_analysis.recommendation);
// Output: "Garbage detected with high confidence. Immediate action recommended."
```

---

## 📂 OUTPUT FILES SUMMARY

### After Video Analysis Completes

**Video Annotations** (available in Route 1 response):

```
outputs/
└── f47ac10b-58cc-4372-a567-0e02b2c3d479/
    ├── annotated_violations.mp4      (Full video + boxes)
    ├── analysis.json                 (All data)
    └── violation_frames/
        ├── 0001.jpg
        ├── 0002.jpg
        └── 0003.jpg
```

**Garbage Image** (available in Route 1 response):

```
outputs/garbage/
└── f47ac10b-58cc-4372-a567-0e02b2c3d479_best.jpg
```

---

## ⏱️ Timeline Example (30-second video)

```
00:00 - Video upload starts
00:05 - File arrives at backend
00:06 - ML Service starts (helmet + vehicle + garbage detection)
00:45 - ML Service completes → outputs annotated video
00:45 - OCR Service starts (parallel, if violations found)
00:55 - OCR Service completes → plates extracted
00:56 - Response compiled and sent back to frontend
```

**Total time**: ~50 seconds for a 30-second video

---

## ✅ Complete Response Example

```json
{
  "success": true,
  "video_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",

  "video": {
    "filename": "analysis_123-xxx.mp4",
    "upload_path": "/uploads/videos/analysis_123-xxx.mp4",
    "size": 125500000,
    "duration": 30.5,
    "fps": 25,
    "resolution": "1920x1080"
  },

  "analysis": {
    "helmet_violations": [
      {
        "frame_number": 100,
        "confidence": 0.95,
        "bbox": [10, 20, 100, 150]
      },
      {
        "frame_number": 250,
        "confidence": 0.88,
        "bbox": [500, 100, 600, 350]
      }
    ],
    "vehicle_threats": [
      {
        "frame_number": 150,
        "vehicle_type": "car",
        "threat_score": 75,
        "threat_level": "medium",
        "bbox": [50, 200, 800, 500],
        "confidence": 0.92
      }
    ],
    "garbage_detection": {
      "detected": true,
      "best_frame_path": "/outputs/garbage/f47ac10b_best.jpg",
      "confidence": 0.87,
      "frame_number": 300
    },
    "license_plates": {
      "primary": "MH14GE9533",
      "primary_votes": 8,
      "secondary": "MH14GE9532",
      "secondary_votes": 2,
      "extraction_confidence": 0.92,
      "frames_analyzed": 12
    }
  },

  "output": {
    "annotated_video": "/outputs/f47ac10b/annotated_violations.mp4",
    "violation_frames": "/outputs/f47ac10b/violation_frames/",
    "garbage_frames": "/outputs/garbage/",
    "analytics_file": "/outputs/f47ac10b/analysis.json"
  },

  "statistics": {
    "total_frames": 750,
    "violation_frames_count": 5,
    "processing_time_seconds": 45.23,
    "frames_per_second": 16.6
  },

  "timestamp": "2026-01-30T15:30:45.123Z"
}
```

---

## 🎯 Frontend Integration Summary

### Route 1: Video Upload & Analysis

```javascript
// Upload video
const formData = new FormData();
formData.append("video", videoFile);

const response = await fetch("/api/video-analysis", {
  method: "POST",
  body: formData,
});

const result = await response.json();

// Display results
if (result.success) {
  // Show helmet violations
  console.log(`Helmet violations: ${result.analysis.helmet_violations.length}`);

  // Show license plate
  console.log(`License plate: ${result.analysis.license_plates.primary}`);

  // Show garbage status
  console.log(
    `Garbage: ${result.analysis.garbage_detection.detected ? "Yes" : "No"}`,
  );

  // Play annotated video
  document.getElementById("video").src = result.output.annotated_video;

  // Show garbage image if detected
  if (result.analysis.garbage_detection.detected) {
    document.getElementById("garbageImg").src =
      result.analysis.garbage_detection.best_frame_path;
  }
}
```

### Route 2: Garbage Details (Optional)

```javascript
// Get detailed garbage info
const garbageResponse = await fetch("/api/garbage-analysis", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ video_id: result.video_id }),
});

const garbageData = await garbageResponse.json();

// Show recommendation
console.log(`Recommendation: ${garbageData.garbage_analysis.recommendation}`);
```

---

## 🎉 Summary

When you upload a video:

1. ✅ **Helmet Detection** → Finds people without helmets (with frame numbers)
2. ✅ **Vehicle Threat Detection** → Scores vehicle danger levels (0-100)
3. ✅ **Garbage Detection** → Detects garbage/waste (yes/no + best frame)
4. ✅ **License Plate Extraction** → Reads vehicle registration number
5. ✅ **Annotated Video** → Full video with all boxes drawn
6. ✅ **Garbage Frame** → Best frame showing garbage
7. ✅ **Violation Frames** → Individual JPG images of violations
8. ✅ **JSON Response** → All data in structured format

**Two Routes**:

- **Route 1 (POST /api/video-analysis)**: Upload video, get ALL results
- **Route 2 (POST /api/garbage-analysis)**: Get detailed garbage info using video_id

Everything is available in **one JSON response** from Route 1!
