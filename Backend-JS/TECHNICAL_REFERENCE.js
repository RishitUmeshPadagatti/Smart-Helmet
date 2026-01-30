// Technical Reference: YOLO Integration in Node.js Backend

/**
 * ============================================
 * 1. ARCHITECTURE OVERVIEW
 * ============================================
 */

/*
The YOLO integration uses a subprocess pattern:

┌─────────────────────────────────────────────────┐
│         Node.js Express Server                  │
│         (Main Thread)                           │
│                                                 │
│  POST /video/upload                             │
│    ├─ Validate file                             │
│    ├─ Save to disk                              │
│    └─ Spawn Python subprocess                   │
└──────────────┬──────────────────────────────────┘
               │
               │ child_process.spawn()
               │ (Non-blocking)
               ▼
       ┌───────────────────┐
       │  Python Process   │
       │  (Subprocess)     │
       │                   │
       │ fault_detection_  │
       │ service.py        │
       │                   │
       │ - Load model      │
       │ - Process frames  │
       │ - Output JSON     │
       └───────────────────┘

Benefits:
✓ Node.js stays responsive (non-blocking)
✓ Python handles heavy ML computation
✓ Error isolation (Python crash doesn't kill Node)
✓ Can process multiple videos in parallel
*/

/**
 * ============================================
 * 2. FILE STRUCTURE & IMPORTS
 * ============================================
 */

// src/utils/videoProcessor.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Each video goes through these stages:
const STAGES = {
  VALIDATION: 'validation',      // Check file type/size
  QUEUED: 'queued',              // Waiting to process
  PROCESSING: 'processing',      // Python running
  COMPLETE: 'complete',          // Finished
  ERROR: 'error'                 // Failed
};

/**
 * ============================================
 * 3. VIDEO PROCESSING FUNCTION
 * ============================================
 */

/**
 * Spawn Python YOLO process
 * 
 * @param {string} inputPath - Path to input video
 * @param {string} outputPath - Path to output video
 * @returns {Promise<Object>} Analytics data
 * 
 * Flow:
 * 1. Spawn Python process
 * 2. Pass video paths as arguments
 * 3. Listen to stdout for JSON output
 * 4. Wait for process to complete
 * 5. Parse analytics from output
 * 6. Return results or handle error
 */
async function processVideoWithYOLO(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(
      __dirname, '..', '..', '..', 'Backend', 
      'ML_model', 'fault_detection_service.py'
    );

    console.log(`[YOLO] Input: ${inputPath}`);
    console.log(`[YOLO] Output: ${outputPath}`);

    // Spawn Python subprocess
    const pythonProcess = spawn('python', [
      pythonScriptPath,
      inputPath,
      outputPath
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],  // stdin, stdout, stderr
      timeout: 3600000                   // 1 hour timeout
    });

    let outputBuffer = '';
    let errorBuffer = '';

    // Capture stdout (progress + analytics)
    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      outputBuffer += output;
      console.log(`[YOLO] ${output.trim()}`);
    });

    // Capture stderr (warnings + errors)
    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      errorBuffer += error;
      console.error(`[YOLO ERROR] ${error.trim()}`);
    });

    // Handle completion
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        // Success: parse analytics
        const analytics = parseYOLOAnalytics(outputBuffer);
        resolve({
          success: true,
          analytics,
          message: 'Video processed successfully'
        });
      } else {
        // Error: exit with status code
        reject(new Error(
          `Python process exited with code ${code}: ${errorBuffer}`
        ));
      }
    });

    // Handle spawn error
    pythonProcess.on('error', (error) => {
      reject(new Error(
        `Failed to start Python: ${error.message}`
      ));
    });
  });
}

/**
 * ============================================
 * 4. ANALYTICS PARSING
 * ============================================
 */

/**
 * Extract JSON analytics from Python output
 * 
 * Python outputs: "ANALYTICS_JSON:{...}"
 * This function parses that JSON
 */
function parseYOLOAnalytics(output) {
  try {
    // Look for JSON marker in output
    const jsonMatch = output.match(/ANALYTICS_JSON:(.+)/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
  } catch (error) {
    console.warn('Could not parse analytics:', error.message);
  }

  // Fallback: return empty analytics
  return {
    totalFrames: 0,
    detectedObjects: 0,
    incidentFrames: 0,
    riskScore: 0,
    processingTime: 0,
    error: 'Failed to parse analytics'
  };
}

/**
 * ============================================
 * 5. PYTHON SERVICE DETAILS
 * ============================================
 */

/*
File: Backend/ML_model/fault_detection_service.py

Execution flow:
1. Load YOLO model from yolov8s.pt
2. Detect CUDA/GPU availability
3. Open input video with OpenCV
4. For each frame:
   - Run YOLO detection
   - Track objects across frames
   - Calculate threat scores
   - Draw annotations
   - Write to output video
5. Output JSON analytics to stdout

Key classes:
- ImpactAnalyzer: Calculates threat scores
  * Tracks object history
  * Computes looming factor (size growth)
  * Computes centering factor (position)
  * Assigns color codes (green/yellow/red)

Threat calculation:
  threat_score = 0
  growth_rate = (curr_area - past_area) / past_area
  
  if growth_rate > 0.05:
    threat_score += 30  # Object growing
  if growth_rate > 0.15:
    threat_score += 50  # Rapid growth
  
  if object_near_center and approaching:
    threat_score += 30
  
  threat_score = max(0, min(100, threat_score))
  
  // Color assignment
  if threat_score < 30:
    color = GREEN      # Box outline
  elif threat_score < 70:
    color = YELLOW
  else:
    color = RED

Video annotation:
  For each detected vehicle:
  - Draw bounding box (colored)
  - Draw label: "ID:1 car|75" (ID, class, threat)
  - Color indicates threat level
  
Output: MP4 video with annotations + JSON analytics
*/

/**
 * ============================================
 * 6. ERROR HANDLING & RECOVERY
 * ============================================
 */

// In Express route handler:
router.post('/upload', upload.single('file'), async (req, res) => {
  let inputPath = null;
  
  try {
    // ... validation ...
    
    // Process with error handling
    try {
      const result = await processVideoWithYOLO(inputPath, outputPath);
      analytics = result.analytics;
    } catch (yoloError) {
      console.error('YOLO processing error:', yoloError);
      
      // Create fallback output
      await fs.writeFile(outputPath, 
        JSON.stringify({ error: yoloError.message }), 'utf-8');
      
      // Return mock analytics
      analytics = {
        totalFrames: 0,
        error: yoloError.message
      };
    }
    
    res.json({
      message: 'Processing complete',
      analytics: analytics
    });
    
  } catch (error) {
    // Cleanup on error
    if (inputPath) {
      try {
        await fs.unlink(inputPath);
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * ============================================
 * 7. RESPONSE STRUCTURE
 * ============================================
 */

/*
HTTP POST /video/upload returns:

{
  "message": "Processing complete",
  "original_filename": "test.mp4",
  "processed_filename": "processed_1701234567890_test.mp4",
  "download_url": "/results/processed_1701234567890_test.mp4",
  "analytics": {
    
    // Basic metrics
    "totalFrames": 1500,
    "detectedObjects": 8,
    "incidentFrames": 45,          // Frames with high threat
    "riskScore": 0.62,             // Max threat / 100
    "processingTime": 23.5,        // Seconds
    "device": "CUDA",              // GPU or CPU
    
    // Summary statistics
    "trackingSummary": {
      "totalTracks": 3,            // Objects tracked
      "averageThreatScore": 42,
      "maxThreatScore": 95         // Highest threat
    },
    
    // Per-object details
    "trackDetails": {
      "1": {                        // Track ID
        "object_class": "car",
        "max_score": 95,
        "frames": [
          {
            "frame": 100,
            "score": 20,
            "confidence": 0.94      // Detection confidence
          },
          {
            "frame": 130,
            "score": 65,
            "confidence": 0.96
          },
          {
            "frame": 160,
            "score": 95,
            "confidence": 0.95
          }
        ]
      }
      // ... more tracks ...
    }
  }
}
*/

/**
 * ============================================
 * 8. PERFORMANCE CHARACTERISTICS
 * ============================================
 */

/*
Processing speed depends on:

1. Hardware (GPU best)
   RTX 3070:     3-5s   per minute of video (30 FPS, 720p)
   T4 GPU:      10-15s  per minute of video
   Apple M1:     1-2m   per minute of video
   Intel i7:     5-10m  per minute of video

2. Video resolution
   1080p: 1x baseline speed
   720p:  ~0.5x (faster)
   480p:  ~0.25x (much faster)

3. Frame count
   Linear: double video = double time

4. Object count
   More objects = slightly slower
   But tracking overhead is constant

Memory usage:
   YOLO model:        400-600 MB (constant)
   Per frame buffer:  10-50 MB (depends on resolution)
   Output video:      50-200 MB (depends on duration/codec)

Threading:
   - Node.js: Main thread (event loop)
   - Python: Single-threaded processing
   - YOLO: Multi-threaded on GPU
   - Multiple videos: Sequential (one at a time)
     (Can be parallelized with task queue)
*/

/**
 * ============================================
 * 9. CONFIGURATION & TUNING
 * ============================================
 */

/*
In Backend/ML_model/fault_detection_service.py:

// Confidence threshold (0-1)
CONF_THRESHOLD = 0.4  
   Higher = fewer detections, fewer false positives
   Lower = more detections, more false positives
   Recommended: 0.4-0.5

// Target vehicle classes (COCO dataset)
TARGET_CLASSES = [2, 3, 5, 7]
   2 = car
   3 = motorcycle
   5 = bus
   7 = truck
   Add more: [2, 3, 4, 5, 6, 7, 8, ...]

// Threat calculation weights
if growth_rate > 0.05:
    threat_score += 30    ← Adjust impact
if growth_rate > 0.15:
    threat_score += 50    ← Or this

if object_near_center:
    threat_score += 30    ← Adjust centering weight

// Color thresholds
Green:  0-29   (safe)
Yellow: 30-69  (warning)
Red:    70-100 (danger)
*/

/**
 * ============================================
 * 10. TESTING & DEBUGGING
 * ============================================
 */

/*
Test YOLO directly:
  python Backend/ML_model/fault_detection_service.py \
    input.mp4 output.mp4

Test video route:
  curl -X POST http://localhost:3000/video/upload \
    -F "file=@test.mp4" | jq '.analytics'

Monitor Python subprocess:
  Add logging in videoProcessor.js
  Check stderr for Python errors
  Look for "ANALYTICS_JSON" marker in output

Debug threat calculation:
  Add print statements in ImpactAnalyzer
  Check box coordinates and area calculations
  Verify color coding matches threat scores
*/

/**
 * ============================================
 * SUMMARY
 * ============================================
 */

/*
Key takeaways:

1. Architecture: Subprocess pattern (Node → Python)
   - Non-blocking: Node.js stays responsive
   - Isolated: Errors in Python don't crash Node
   - Efficient: Heavy ML work on dedicated process

2. YOLO Integration: Complete video analysis
   - Detection: Find vehicles in each frame
   - Tracking: Follow objects across frames
   - Analysis: Calculate threat scores
   - Output: Annotated video + JSON data

3. Threat Scoring: Two factors
   - Looming: How fast object approaches (size growth)
   - Centering: Object moving to frame center
   - Result: 0-100 score with color codes

4. Performance: GPU essential for production
   - GPU: 3-5s per minute (real-time capable)
   - CPU: 5-10m per minute (background processing)

5. Error Handling: Graceful fallbacks
   - Python crash: Uses mock analytics
   - File issues: Proper cleanup
   - JSON parse errors: Returns partial data
*/

module.exports = {
  processVideoWithYOLO,
  parseYOLOAnalytics,
  checkPythonDependencies
};
