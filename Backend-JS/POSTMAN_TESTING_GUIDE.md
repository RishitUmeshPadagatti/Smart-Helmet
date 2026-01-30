# Postman Testing Guide - Complete API Walkthrough

## 🚀 Quick Start

### 1. Install Postman

- Download from: https://www.postman.com/downloads/
- Install and open

### 2. Create New Collection

- Click **Collections** → **+ New Collection**
- Name it: `Smart Helmet API`
- Click **Create**

### 3. Add Requests

Add each request below to your collection

---

## ✅ TEST 1: Health Check

### Purpose

Check if backend server is running

### Request Details

```
Method: GET
URL: http://localhost:3000/health
Headers: None
Body: None
```

### How to Set Up in Postman

1. Click **+ New Request**
2. Set Method to **GET**
3. Enter URL: `http://localhost:3000/health`
4. Click **Send**

### Expected Response (200 OK)

```json
{
  "status": "OK",
  "timestamp": "2026-01-30T15:30:45.123Z"
}
```

### What It Means

✅ Backend server is running and responding

---

## ✅ TEST 2: Helmet Detection Health

### Purpose

Check if helmet detection service is available

### Request Details

```
Method: GET
URL: http://localhost:3000/helmet-detect/health
Headers: None
Body: None
```

### How to Set Up in Postman

1. Click **+ New Request**
2. Set Method to **GET**
3. Enter URL: `http://localhost:3000/helmet-detect/health`
4. Click **Send**

### Expected Response (200 OK)

```json
{
  "status": "OK",
  "service": "helmet-detection",
  "models_loaded": true,
  "timestamp": "2026-01-30T15:30:45.123Z"
}
```

---

## 🎥 TEST 3: Main Video Analysis (IMPORTANT!)

### Purpose

Upload video and get complete analysis (helmet + garbage + plate)

### Step 1: Prepare a Test Video

- Find a video file on your computer (MP4, AVI, MOV, etc.)
- Recommended: 10-30 seconds long
- Location: `C:\Users\MOHITH\Desktop\` or anywhere accessible

### Step 2: Set Up Request in Postman

1. Click **+ New Request**
2. Set Method to **POST**
3. Enter URL: `http://localhost:3000/api/video-analysis`
4. Click **Headers** tab
   - Leave default (Postman sets Content-Type automatically)
5. Click **Body** tab
   - Select **form-data** (NOT raw, NOT JSON)
6. In the form-data:
   - Key: `video` (must be exactly "video")
   - Value: Click on the dropdown and select **File**
   - Click the file icon and choose your test video
7. Click **Send**

### Visual Guide

```
┌─────────────────────────────────────────┐
│ Method: POST                            │
│ URL: http://localhost:3000/api/...      │
├─────────────────────────────────────────┤
│ BODY Tab → form-data:                   │
│                                         │
│ Key      │ Value                        │
│ ─────────┼────────────────────────      │
│ video    │ [Choose File]                │
│          │ /path/to/video.mp4           │
└─────────────────────────────────────────┘
```

### Processing Wait

- Small video (10-20s): Wait 30-40 seconds
- Medium video (30-60s): Wait 50-80 seconds
- Large video (2+ min): Wait 120+ seconds
- **DO NOT cancel request** while processing

### Expected Response (200 OK)

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

### What Each Field Means

**video_id**:

- Unique identifier for this analysis
- Save this! You'll need it for the next test

**helmet_violations array**:

- Each object = one person without helmet
- frame_number: Which frame had the violation
- confidence: How sure (0-1, higher is better)

**vehicle_threats array**:

- Each object = detected vehicle
- threat_score: How dangerous (0-100)
- vehicle_type: car, motorcycle, bus, truck

**garbage_detection**:

- detected: true = garbage found, false = no garbage
- best_frame_path: Path to the garbage image
- confidence: How sure about garbage

**license_plates**:

- primary: Main license plate number
- primary_votes: How many frames detected this
- secondary: Alternative plate detected
- extraction_confidence: How sure about plate

**output paths**:

- annotated_video: Video with all boxes drawn
- violation_frames: Individual JPG images
- garbage_frames: Garbage images directory
- analytics_file: JSON file with all data

---

## 🗑️ TEST 4: Garbage Analysis (Follow-up)

### Purpose

Get detailed garbage information using video_id from Test 3

### Step 1: Get video_id from Previous Response

- Look at Test 3 response
- Copy the `video_id` value (e.g., `f47ac10b-58cc-4372-a567-0e02b2c3d479`)

### Step 2: Set Up Request in Postman

1. Click **+ New Request**
2. Set Method to **POST**
3. Enter URL: `http://localhost:3000/api/garbage-analysis`
4. Click **Headers** tab
   - Add: `Content-Type` = `application/json`
5. Click **Body** tab
   - Select **raw**
   - Select **JSON** (dropdown on the right)
   - Paste:

```json
{
  "video_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```

6. Replace the video_id with the one from Test 3
7. Click **Send**

### Expected Response (200 OK) - Garbage Detected

```json
{
  "success": true,
  "video_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "garbage_analysis": {
    "detected": true,
    "best_frame_path": "/outputs/garbage/f47ac10b_best.jpg",
    "confidence": 0.87,
    "recommendation": "Garbage detected with high confidence. Immediate action recommended."
  },
  "timestamp": "2026-01-30T15:35:20.456Z"
}
```

### Expected Response - No Garbage

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

---

## 👁️ TEST 5: View Generated Files

### Purpose

Download and view the generated video and images

### Files Available

#### Annotated Video

- **URL**: `http://localhost:3000/outputs/{video_id}/annotated_violations.mp4`
- Replace `{video_id}` with your video ID
- Example: `http://localhost:3000/outputs/f47ac10b-58cc-4372-a567-0e02b2c3d479/annotated_violations.mp4`
- Opens in browser: Play the video with all detection boxes drawn

#### Garbage Frame

- **URL**: `http://localhost:3000/outputs/garbage/{video_id}_best.jpg`
- Example: `http://localhost:3000/outputs/garbage/f47ac10b_best.jpg`
- Opens in browser: Shows the best garbage frame

#### Violation Frames

- **URL**: `http://localhost:3000/outputs/{video_id}/violation_frames/`
- Example: `http://localhost:3000/outputs/f47ac10b/violation_frames/`
- Opens in browser: Lists all violation frame images

#### Analysis JSON

- **URL**: `http://localhost:3000/outputs/{video_id}/analysis.json`
- Example: `http://localhost:3000/outputs/f47ac10b/analysis.json`
- Opens in browser: Raw JSON data

### How to View in Postman

1. Create **GET** request
2. Enter file URL (from above)
3. Click **Send**
4. Response shows file content/video

---

## 🧪 TEST 6: Single Image Helmet Detection

### Purpose

Test helmet detection on a single photo (optional, for comparison)

### Step 1: Prepare a Photo

- Take a photo of someone with/without helmet
- Supported formats: JPG, PNG, BMP

### Step 2: Set Up Request

1. Click **+ New Request**
2. Set Method to **POST**
3. Enter URL: `http://localhost:3000/helmet-detect/detect`
4. Click **Body** tab
   - Select **form-data**
5. In form-data:
   - Key: `image` (must be "image")
   - Value: [Choose File] → select your photo
6. Click **Send**

### Expected Response

```json
{
  "success": true,
  "detections": [
    {
      "person_id": 0,
      "helmet": true,
      "confidence": 0.95,
      "bbox": [100, 50, 200, 250]
    },
    {
      "person_id": 1,
      "helmet": false,
      "confidence": 0.88,
      "bbox": [500, 100, 600, 350]
    }
  ],
  "image_info": {
    "width": 1920,
    "height": 1080,
    "format": "jpg"
  },
  "processing_time_ms": 245
}
```

---

## 📋 Error Testing & Troubleshooting

### Error 1: No Video File

**How to trigger**: Send request WITHOUT uploading a file

**Request**:

- Method: POST
- URL: `http://localhost:3000/api/video-analysis`
- Body: form-data with NO file
- Send

**Response (400 Bad Request)**:

```json
{
  "success": false,
  "error": "No video file uploaded. Please provide a video with field name \"video\""
}
```

---

### Error 2: Wrong File Format

**How to trigger**: Upload a non-video file (e.g., .txt, .doc, .zip)

**Request**:

- Method: POST
- URL: `http://localhost:3000/api/video-analysis`
- Body: form-data
- Key: `video`
- Value: [Choose File] → select a .txt file
- Send

**Response (400 Bad Request)**:

```json
{
  "success": false,
  "error": "Video format not supported. Use: .mp4, .avi, .mov, .mkv, .webm, .flv, .wmv"
}
```

---

### Error 3: File Too Large

**How to trigger**: Upload a video larger than 500MB

**Response (400 Bad Request)**:

```json
{
  "success": false,
  "error": "File size exceeds 500MB limit"
}
```

---

### Error 4: Server Not Running

**Error**: "Cannot GET http://localhost:3000/health"

**Solution**:

```bash
# In terminal, navigate to Backend-JS folder
cd Backend-JS
npm start
```

Wait for message: `Server listening on port 3000`

---

### Error 5: Wrong video_id Format

**How to trigger**: Call garbage-analysis with non-existent video_id

**Request**:

```json
{
  "video_id": "invalid-id-that-does-not-exist"
}
```

**Response**:

```json
{
  "success": true,
  "video_id": "invalid-id-that-does-not-exist",
  "garbage_analysis": {
    "detected": false,
    "best_frame_path": null,
    "confidence": 0,
    "recommendation": "No garbage detected in the video."
  },
  "timestamp": "2026-01-30T15:35:20.456Z"
}
```

---

## 🔍 Debugging Tips

### Check Console Logs

While running `npm start`, you'll see logs:

```
[Video Analysis] Starting comprehensive video analysis
[Video Analysis] Video ID: f47ac10b-58cc-4372-a567-0e02b2c3d479
[Step 1] Running ML service (helmet + vehicle + garbage detection)...
[Step 1] ML service completed
[Results] Helmet violations found: 5
[Results] Vehicle threats found: 2
[Results] Garbage detected: true
[Step 2] Running OCR for license plate extraction...
[Summary] Analysis complete in 45.23s
```

### Check if Models Loaded

Look for:

```
[ML Service] Models loaded successfully
[OCR Service] EasyOCR initialized
```

### Check Generated Files

```bash
# List all outputs
dir outputs\

# Check specific video output
dir outputs\f47ac10b-58cc-4372-a567-0e02b2c3d479\

# Check garbage frames
dir outputs\garbage\
```

---

## 📊 Test Sequence

Here's the recommended order to test everything:

```
1. ✅ Health Check (GET /health)
   └─ Confirms server is running

2. ✅ Helmet Service Health (GET /helmet-detect/health)
   └─ Confirms helmet detection is available

3. 🎥 Main Video Analysis (POST /api/video-analysis)
   └─ Upload video → Get analysis
   └─ Save video_id from response

4. 🗑️ Garbage Analysis (POST /api/garbage-analysis)
   └─ Use video_id from step 3
   └─ Get garbage details

5. 👁️ View Files (GET /outputs/...)
   └─ Download and view generated files

6. 🧪 Single Image Test (POST /helmet-detect/detect)
   └─ Optional: Test on single photo
```

---

## 💾 Postman Collection JSON (Optional)

You can import this into Postman. Create a file named `Smart-Helmet-API.postman_collection.json`:

```json
{
  "info": {
    "name": "Smart Helmet API",
    "description": "Complete API testing collection",
    "version": "1.0"
  },
  "item": [
    {
      "name": "1. Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/health"
      }
    },
    {
      "name": "2. Helmet Detection Health",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/helmet-detect/health"
      }
    },
    {
      "name": "3. Video Analysis",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/video-analysis",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "video",
              "type": "file",
              "src": "path/to/video.mp4"
            }
          ]
        }
      }
    },
    {
      "name": "4. Garbage Analysis",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/garbage-analysis",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"video_id\": \"YOUR_VIDEO_ID_HERE\"}"
        }
      }
    }
  ]
}
```

---

## ⏱️ Expected Processing Times

| Video Length | Processing Time | Notes      |
| ------------ | --------------- | ---------- |
| 10 seconds   | 20-30s          | Fast       |
| 30 seconds   | 40-50s          | Typical    |
| 1 minute     | 80-100s         | Longer     |
| 5 minutes    | 300-350s        | Very large |

**Note**: Times may vary based on:

- Computer CPU/RAM
- Video resolution
- Number of violations detected
- Garbage detection intensity

---

## 🎯 Quick Reference

### Main Endpoints

| #   | Method | URL                                            | Purpose                        |
| --- | ------ | ---------------------------------------------- | ------------------------------ |
| 1   | GET    | `/health`                                      | Server health                  |
| 2   | GET    | `/helmet-detect/health`                        | Helmet service health          |
| 3   | POST   | `/api/video-analysis`                          | Upload video, get all analysis |
| 4   | POST   | `/api/garbage-analysis`                        | Get garbage details            |
| 5   | GET    | `/outputs/{video_id}/annotated_violations.mp4` | Download annotated video       |
| 6   | GET    | `/outputs/garbage/{video_id}_best.jpg`         | Download garbage frame         |

### Required Headers

| Endpoint                | Content-Type                      |
| ----------------------- | --------------------------------- |
| `/api/video-analysis`   | `multipart/form-data` (automatic) |
| `/api/garbage-analysis` | `application/json`                |
| `/helmet-detect/detect` | `multipart/form-data` (automatic) |

### Required Body Fields

| Endpoint                | Field      | Type          |
| ----------------------- | ---------- | ------------- |
| `/api/video-analysis`   | `video`    | File (video)  |
| `/api/garbage-analysis` | `video_id` | String (JSON) |
| `/helmet-detect/detect` | `image`    | File (image)  |

---

## 🎉 Success Indicators

✅ All tests passing when:

1. Health checks return `status: OK`
2. Video analysis returns `success: true`
3. Violations are detected properly
4. Files are created in outputs folder
5. Garbage analysis returns correct status
6. All file paths are accessible

---

## 📝 Notes

- **Keep server running** during all tests: `npm start`
- **Wait for processing**: Don't close Postman while analyzing
- **Save video_id**: You need it for garbage analysis test
- **Check console logs**: Shows what's happening during analysis
- **File sizes**: Output files (video, images) will be large (50-200MB total)

---

## 🚀 Next Steps

After testing:

1. ✅ Verify all endpoints work
2. ✅ Check file generation
3. ✅ Review response format
4. ✅ Prepare frontend integration
5. ✅ Test with various video types

**All tests passing?** → Ready for frontend integration! 🎉
