// HELMET DETECTION API - QUICK REFERENCE

/**
 * ============================================
 * QUICK START (Copy & Paste Ready)
 * ============================================
 */

// 1. CHECK SERVICE HEALTH
curl http://localhost:3000/helmet-detect/health

// 2. DETECT HELMET IN IMAGE
curl -X POST http://localhost:3000/helmet-detect/detect \
  -F "image=@your_image.jpg"

// 3. PRETTY PRINT RESPONSE
curl -s -X POST http://localhost:3000/helmet-detect/detect \
  -F "image=@test.jpg" | jq '.'

// 4. EXTRACT DECISION ONLY
curl -s -X POST http://localhost:3000/helmet-detect/detect \
  -F "image=@test.jpg" | jq '.detection.summary.decision'

/**
 * ============================================
 * RESPONSE EXAMPLES
 * ============================================
 */

// SUCCESS RESPONSE (200 OK)
{
  "success": true,
  "image": {
    "filename": "helmet_1234567890-abc.jpg",
    "path": "/uploads/helmet_1234567890-abc.jpg",
    "size": 45678
  },
  "detection": {
    "detected_classes": ["helmet", "no-helmet"],
    "detection_count": 2,
    "detections": [
      {
        "class": "helmet",
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

// ERROR RESPONSE (400/500)
{
  "success": false,
  "error": "Error description"
}

/**
 * ============================================
 * JAVASCRIPT / FETCH API
 * ============================================
 */

async function detectHelmet(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('/helmet-detect/detect', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Helmet detected:', result.detection.summary.decision);
  }
  
  return result;
}

/**
 * ============================================
 * REACT NATIVE / EXPO
 * ============================================
 */

// Option 1: Using FormData
async function detectHelmetRN(imageUri) {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'helmet.jpg'
  });

  const response = await fetch('http://backend:3000/helmet-detect/detect', {
    method: 'POST',
    body: formData
  });

  return await response.json();
}

// Option 2: Using a hook
import { useState } from 'react';

export function useHelmetDetection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detect = async (imageUri) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'helmet.jpg'
      });

      const res = await fetch('http://backend:3000/helmet-detect/detect', {
        method: 'POST',
        body: formData
      });
      
      return await res.json();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { detect, loading, error };
}

/**
 * ============================================
 * COMMON PATTERNS
 * ============================================
 */

// Check if helmet is detected
const isHelmetDetected = response.detection.summary.decision === 'helmet';

// Get detection confidence
const confidence = response.detection.detections[0]?.confidence || 0;

// Get all detected objects
const allDetections = response.detection.detections.map(d => ({
  class: d.class,
  confidence: (d.confidence * 100).toFixed(2) + '%'
}));

// Get bounding box for drawing on image
const bbox = response.detection.detections[0]?.bbox;
// Use bbox.x1, bbox.y1, bbox.x2, bbox.y2 for Canvas drawing

// Count helmets
const helmetCount = response.detection.summary.helmet_count;

/**
 * ============================================
 * ERROR HANDLING
 * ============================================
 */

async function detectWithErrorHandling(imageFile) {
  try {
    // Validate file
    if (imageFile.size > 50 * 1024 * 1024) {
      throw new Error('File too large (max 50MB)');
    }

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/bmp'].includes(imageFile.type)) {
      throw new Error('Invalid image format');
    }

    // Perform detection
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch('/helmet-detect/detect', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Detection failed');
    }

    return result;

  } catch (error) {
    console.error('Helmet detection error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * ============================================
 * INTEGRATION WITH APP LOGIC
 * ============================================
 */

async function handleImageCapture(capturedImage) {
  const detection = await detectHelmet(capturedImage);

  if (!detection.success) {
    showError('Detection failed: ' + detection.error);
    return;
  }

  const { decision, helmet_count, no_helmet_count } = detection.detection.summary;

  if (decision === 'no-helmet') {
    // Trigger SOS or alert
    triggerHelmetViolationAlert({
      timestamp: detection.timestamp,
      imageUrl: detection.image.path,
      detections: detection.detection.detections
    });
  } else if (decision === 'helmet') {
    console.log('Helmet properly detected ✓');
  } else {
    console.log('No clear detection');
  }

  // Update UI
  updateDetectionUI({
    helmetDetected: decision === 'helmet',
    objectCount: detection.detection.detection_count,
    confidence: detection.detection.detections[0]?.confidence || 0
  });
}

/**
 * ============================================
 * SETUP CHECKLIST
 * ============================================
 */

/*
Requirements:
□ Python 3.8+
□ Node.js 14+
□ ultralytics package (pip install ultralytics)
□ helmet_best.pt in Backend-JS/ML_model/
□ multer package in Backend-JS (already included)

Setup Steps:
1. pip install ultralytics
2. npm install (in Backend-JS)
3. npm run dev
4. Test: curl http://localhost:3000/helmet-detect/health
5. Test: curl -X POST http://localhost:3000/helmet-detect/detect -F "image=@test.jpg"

Files Created:
✓ Backend-JS/ML_model/predict_helmet.py
✓ Backend-JS/src/routes/helmet.js
✓ Backend-JS/HELMET_DETECTION.md
✓ Backend-JS/HELMET_DETECTION_SETUP.md
✓ Backend-JS/EXAMPLES.js
✓ Backend-JS/test_helmet_detection.sh
✓ Backend-JS/test_helmet_detection.bat

Files Modified:
✓ Backend-JS/src/routes/index.js (added helmet router)
*/

/**
 * ============================================
 * ENDPOINTS SUMMARY
 * ============================================
 */

/*
GET /helmet-detect/health
- Check service status
- Verify model and script files exist
- Returns: { status, components }

POST /helmet-detect/detect
- Upload image and detect helmet
- Accepts: multipart/form-data with 'image' field
- Returns: { success, image, detection, timestamp }
- Max file size: 50MB
- Timeout: 120 seconds
- Supported formats: JPG, JPEG, PNG, BMP, GIF
*/

/**
 * ============================================
 * RESPONSE STRUCTURE
 * ============================================
 */

/*
Detection Object Structure:
{
  class: string              - Object class (helmet, no-helmet, etc)
  class_id: number           - Class ID from model
  confidence: number         - Confidence score (0-1)
  bbox: {                    - Bounding box coordinates
    x1: number               - Top-left X
    y1: number               - Top-left Y
    x2: number               - Bottom-right X
    y2: number               - Bottom-right Y
    width: number            - Width
    height: number           - Height
  }
}

Summary Object:
{
  helmet_count: number       - Total helmets detected
  no_helmet_count: number    - Total non-helmets detected
  decision: string           - 'helmet' | 'no-helmet' | 'unknown'
}
*/

/**
 * ============================================
 * DOCUMENTATION LINKS
 * ============================================
 */

/*
Full Documentation: HELMET_DETECTION.md
Setup Guide: HELMET_DETECTION_SETUP.md
Code Examples: EXAMPLES.js
API Tests: test_helmet_detection.sh (Linux/Mac)
API Tests: test_helmet_detection.bat (Windows)

For more info:
- See HELMET_DETECTION.md for complete API documentation
- See EXAMPLES.js for detailed code examples
- See HELMET_DETECTION_SETUP.md for setup and integration guide
*/
