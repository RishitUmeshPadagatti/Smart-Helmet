# Video Analysis API - Frontend Integration Guide

## 🎯 Quick Start for Frontend

### Single Route for Complete Video Analysis

Upload a video once and get **everything** in one response:

- Helmet violations
- Vehicle threats
- Garbage detection
- License plates
- Annotated video
- All metadata

---

## 📤 Upload & Analyze

### Basic Implementation

```javascript
async function uploadAndAnalyzeVideo(videoFile) {
  const formData = new FormData();
  formData.append("video", videoFile);

  try {
    const response = await fetch("http://localhost:3000/api/video-analysis", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return {
        videoId: data.video_id,
        analysis: data.analysis,
        output: data.output,
        statistics: data.statistics,
      };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
```

---

## 🎥 Display Results

### Show Helmet Violations

```javascript
function displayHelmetViolations(analysis) {
  const violations = analysis.helmet_violations;

  if (violations.length === 0) {
    console.log("✅ No helmet violations detected");
    return;
  }

  console.log(`⚠️ Helmet violations found: ${violations.length}`);

  violations.forEach((violation, index) => {
    console.log(
      `  ${index + 1}. Frame ${violation.frame_number}: Confidence ${(violation.confidence * 100).toFixed(1)}%`,
    );
  });
}
```

### Show Vehicle Threats

```javascript
function displayVehicleThreats(analysis) {
  const threats = analysis.vehicle_threats;

  if (threats.length === 0) {
    console.log("✅ No vehicle threats detected");
    return;
  }

  console.log(`⚠️ Vehicle threats found: ${threats.length}`);

  threats.forEach((threat, index) => {
    console.log(
      `  ${index + 1}. ${threat.type}: Threat score ${threat.threat_score}/100`,
    );
  });
}
```

### Show License Plates

```javascript
function displayLicensePlates(analysis) {
  const plates = analysis.license_plates;

  if (plates.primary === "N/A") {
    console.log("❌ No license plate detected");
    return;
  }

  console.log("🚗 License Plates:");
  console.log(`  Primary: ${plates.primary} (${plates.primary_votes} votes)`);

  if (plates.secondary !== "N/A") {
    console.log(
      `  Secondary: ${plates.secondary} (${plates.secondary_votes} votes)`,
    );
  }

  console.log(
    `  OCR Confidence: ${(plates.extraction_confidence * 100).toFixed(1)}%`,
  );
}
```

### Show Garbage Detection

```javascript
function displayGarbageDetection(analysis) {
  const garbage = analysis.garbage_detection;

  if (!garbage.detected) {
    console.log("✅ No garbage detected");
    return;
  }

  console.log("🗑️  Garbage Detected!");
  console.log(`  Confidence: ${(garbage.confidence * 100).toFixed(1)}%`);
  console.log(`  Frame: ${garbage.frame_number}`);
  console.log(`  Image: ${garbage.best_frame_path}`);
}
```

### Display Annotated Video

```javascript
function displayAnnotatedVideo(output, videoElement) {
  const videoUrl = output.annotated_video;

  videoElement.src = videoUrl;
  videoElement.style.display = "block";
  videoElement.controls = true;

  console.log(`Playing: ${videoUrl}`);
}
```

---

## 🖼️ Complete UI Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Smart Helmet Video Analysis</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .container {
        max-width: 1000px;
        margin: 0 auto;
      }
      .section {
        margin: 20px 0;
        padding: 15px;
        border: 1px solid #ccc;
      }
      .section h2 {
        margin-top: 0;
      }
      .violation {
        padding: 10px;
        background: #ffe6e6;
        margin: 5px 0;
      }
      .ok {
        color: green;
      }
      .warning {
        color: orange;
      }
      .error {
        color: red;
      }
      video {
        max-width: 100%;
        margin: 10px 0;
      }
      img {
        max-width: 100%;
        margin: 10px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Smart Helmet Video Analysis</h1>

      <div class="section">
        <h2>Upload Video</h2>
        <input type="file" id="videoInput" accept="video/*" />
        <button onclick="analyzeVideo()">Analyze Video</button>
        <div id="status"></div>
      </div>

      <div class="section" id="resultsSection" style="display: none;">
        <h2>Analysis Results</h2>

        <h3>Statistics</h3>
        <div id="statistics"></div>

        <h3>Helmet Violations</h3>
        <div id="helmetResults"></div>

        <h3>Vehicle Threats</h3>
        <div id="vehicleResults"></div>

        <h3>License Plates</h3>
        <div id="plateResults"></div>

        <h3>Garbage Detection</h3>
        <div id="garbageResults"></div>

        <h3>Annotated Video</h3>
        <video id="annotatedVideo"></video>

        <h3>Garbage Frame</h3>
        <img id="garbageFrame" style="display: none;" />
      </div>
    </div>

    <script>
      async function analyzeVideo() {
        const input = document.getElementById("videoInput");
        const status = document.getElementById("status");

        if (!input.files.length) {
          status.innerHTML = '<span class="error">Please select a video</span>';
          return;
        }

        status.innerHTML = "⏳ Analyzing video...";

        try {
          const formData = new FormData();
          formData.append("video", input.files[0]);

          const response = await fetch(
            "http://localhost:3000/api/video-analysis",
            {
              method: "POST",
              body: formData,
            },
          );

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error);
          }

          status.innerHTML = '<span class="ok">✅ Analysis complete!</span>';
          displayResults(data);
        } catch (error) {
          status.innerHTML = `<span class="error">❌ ${error.message}</span>`;
        }
      }

      function displayResults(data) {
        const analysis = data.analysis;
        const output = data.output;
        const stats = data.statistics;

        // Show results section
        document.getElementById("resultsSection").style.display = "block";

        // Statistics
        document.getElementById("statistics").innerHTML = `
        <p>Total Frames: ${stats.total_frames}</p>
        <p>Violation Frames: ${stats.violation_frames_count}</p>
        <p>Processing Time: ${stats.processing_time_seconds}s</p>
        <p>Speed: ${stats.frames_per_second} FPS</p>
      `;

        // Helmet violations
        if (analysis.helmet_violations.length === 0) {
          document.getElementById("helmetResults").innerHTML =
            '<span class="ok">✅ No helmet violations</span>';
        } else {
          let html = `<span class="warning">⚠️ ${analysis.helmet_violations.length} violations found:</span><br>`;
          analysis.helmet_violations.forEach((v, i) => {
            html += `<div class="violation">
            Frame ${v.frame_number}: ${(v.confidence * 100).toFixed(1)}% confidence
          </div>`;
          });
          document.getElementById("helmetResults").innerHTML = html;
        }

        // Vehicle threats
        if (analysis.vehicle_threats.length === 0) {
          document.getElementById("vehicleResults").innerHTML =
            '<span class="ok">✅ No vehicle threats</span>';
        } else {
          let html = `<span class="warning">⚠️ ${analysis.vehicle_threats.length} threats found:</span><br>`;
          analysis.vehicle_threats.forEach((v, i) => {
            html += `<div class="violation">
            ${v.type}: Threat score ${v.threat_score}/100
          </div>`;
          });
          document.getElementById("vehicleResults").innerHTML = html;
        }

        // License plates
        const plates = analysis.license_plates;
        if (plates.primary === "N/A") {
          document.getElementById("plateResults").innerHTML =
            '<span class="warning">❌ No plate detected</span>';
        } else {
          let html = `<span class="ok">✅ Plate detected:</span><br>
          <strong>Primary:</strong> ${plates.primary} (${plates.primary_votes} votes)<br>`;
          if (plates.secondary !== "N/A") {
            html += `<strong>Secondary:</strong> ${plates.secondary} (${plates.secondary_votes} votes)<br>`;
          }
          html += `<strong>Confidence:</strong> ${(plates.extraction_confidence * 100).toFixed(1)}%`;
          document.getElementById("plateResults").innerHTML = html;
        }

        // Garbage detection
        const garbage = analysis.garbage_detection;
        if (!garbage.detected) {
          document.getElementById("garbageResults").innerHTML =
            '<span class="ok">✅ No garbage detected</span>';
        } else {
          document.getElementById("garbageResults").innerHTML = `
          <span class="warning">🗑️ Garbage detected with ${(garbage.confidence * 100).toFixed(1)}% confidence</span><br>
          Frame: ${garbage.frame_number}
        `;

          // Show garbage frame
          if (garbage.best_frame_path) {
            const img = document.getElementById("garbageFrame");
            img.src = garbage.best_frame_path;
            img.style.display = "block";
          }
        }

        // Show annotated video
        const video = document.getElementById("annotatedVideo");
        video.src = output.annotated_video;
      }
    </script>
  </body>
</html>
```

---

## 🔄 Garbage Analysis Details

After getting video analysis, optionally get more garbage details:

```javascript
async function getGarbageDetails(videoId) {
  const response = await fetch("http://localhost:3000/api/garbage-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ video_id: videoId }),
  });

  const data = await response.json();

  if (data.garbage_analysis.detected) {
    console.log(
      `Garbage Confidence: ${(data.garbage_analysis.confidence * 100).toFixed(1)}%`,
    );
    console.log(`Recommendation: ${data.garbage_analysis.recommendation}`);
    console.log(`Frame: ${data.garbage_analysis.best_frame_path}`);
  }

  return data;
}
```

---

## 📱 React Component Example

```jsx
import React, { useState } from "react";

export function VideoAnalysisUploader() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await fetch("http://localhost:3000/api/video-analysis", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error);

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>⏳ Analyzing video...</div>;
  if (error) return <div>❌ Error: {error}</div>;

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileSelect} />

      {results && (
        <div>
          <h2>✅ Analysis Complete</h2>

          <div>
            <h3>Helmet Violations</h3>
            <p>{results.analysis.helmet_violations.length} found</p>
          </div>

          <div>
            <h3>License Plate</h3>
            <p>{results.analysis.license_plates.primary}</p>
          </div>

          <div>
            <h3>Garbage Detection</h3>
            <p>
              {results.analysis.garbage_detection.detected
                ? "🗑️ Detected"
                : "✅ Not detected"}
            </p>
          </div>

          <div>
            <h3>Annotated Video</h3>
            <video src={results.output.annotated_video} controls />
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 Best Practices

### 1. Show Progress

```javascript
const reader = new FileReader();
reader.addEventListener("progress", (e) => {
  const percent = (e.loaded / e.total) * 100;
  progressBar.style.width = percent + "%";
});
```

### 2. Validate Before Upload

```javascript
function validateVideo(file) {
  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    throw new Error("Video too large (max 500MB)");
  }

  const allowed = ["video/mp4", "video/avi", "video/quicktime"];
  if (!allowed.includes(file.type)) {
    throw new Error("Unsupported video format");
  }
}
```

### 3. Handle Long Processing Times

```javascript
async function analyzeWithTimeout(videoFile, timeoutMs = 600000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Analysis timeout")), timeoutMs),
  );

  const analysis = uploadAndAnalyzeVideo(videoFile);
  return Promise.race([analysis, timeout]);
}
```

### 4. Cache Results

```javascript
const analysisCache = new Map();

function getCachedAnalysis(videoId) {
  return analysisCache.get(videoId);
}

function cacheAnalysis(videoId, results) {
  analysisCache.set(videoId, results);
}
```

---

## 📊 Response Handling Checklist

- ✅ Check `success` flag first
- ✅ Store `video_id` for later reference
- ✅ Display helmet violations count
- ✅ Show vehicle threats
- ✅ Highlight license plate (if found)
- ✅ Alert if garbage detected
- ✅ Play annotated video
- ✅ Show statistics (processing time, frames)
- ✅ Handle no violations case
- ✅ Provide feedback to user

---

## 🔗 Integration Endpoints

| Endpoint                | Method | Purpose                                 |
| ----------------------- | ------ | --------------------------------------- |
| `/api/video-analysis`   | POST   | Upload video, get all analysis          |
| `/api/garbage-analysis` | POST   | Get garbage details for processed video |

---

**Status**: ✅ Ready for Frontend Integration  
**API Version**: 1.0  
**Last Updated**: 2026-01-30
