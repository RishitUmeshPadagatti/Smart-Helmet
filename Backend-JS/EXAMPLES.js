#!/usr/bin/env node

/**
 * Helmet Detection API - Usage Examples
 * 
 * This file demonstrates how to use the helmet detection API
 * from both Node.js and the command line.
 */

// ============================================
// 1. NODE.JS EXAMPLES (JAVASCRIPT)
// ============================================

/**
 * Example 1: Simple detection using Fetch API
 * (For use in React Native or Electron apps)
 */
async function detectHelmetFromFile(imagePath) {
  const fs = require('fs');
  const path = require('path');
  const FormData = require('form-data');
  const axios = require('axios');

  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(
      'http://localhost:3000/helmet-detect/detect',
      form,
      {
        headers: form.getHeaders()
      }
    );

    console.log('Detection Result:');
    console.log(JSON.stringify(response.data, null, 2));

    // Access specific data
    const { detection } = response.data;
    console.log(`\nHelmet Detected: ${detection.summary.decision === 'helmet'}`);
    console.log(`Confidence: ${detection.detections[0]?.confidence || 'N/A'}`);
    console.log(`Total Objects: ${detection.detection_count}`);

    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Example 2: Batch detection with multiple images
 */
async function batchDetectHelmet(imagePaths) {
  const results = [];

  for (const imagePath of imagePaths) {
    try {
      console.log(`Processing: ${imagePath}...`);
      const result = await detectHelmetFromFile(imagePath);
      results.push({
        image: imagePath,
        ...result
      });
    } catch (error) {
      results.push({
        image: imagePath,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Example 3: Real-time detection with Express middleware
 */
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');

function createHelmetDetectionMiddleware() {
  const upload = multer({ dest: 'uploads/' });

  return upload.single('image'), async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      // Forward file to helmet detection API
      const form = new FormData();
      form.append('image', fs.createReadStream(req.file.path));

      const detectionResult = await axios.post(
        'http://localhost:3000/helmet-detect/detect',
        form,
        { headers: form.getHeaders() }
      );

      // Attach detection result to request
      req.helmetDetection = detectionResult.data;
      next();
    } catch (error) {
      console.error('Helmet detection error:', error);
      res.status(500).json({
        error: 'Helmet detection failed',
        details: error.message
      });
    }
  };
}

/**
 * Example 4: Structured API response handling
 */
async function processDetectionResponse(response) {
  const {
    success,
    image,
    detection,
    timestamp
  } = response;

  if (!success) {
    console.error('Detection failed');
    return null;
  }

  // Extract useful information
  const detectionReport = {
    timestamp,
    image: {
      filename: image.filename,
      size: `${(image.size / 1024).toFixed(2)} KB`
    },
    detection: {
      helmetPresent: detection.summary.decision === 'helmet',
      violationDetected: detection.summary.decision === 'no-helmet',
      detectionCount: detection.detection_count,
      classes: detection.detected_classes,
      confidence: detection.detections.map(d => ({
        class: d.class,
        confidence: (d.confidence * 100).toFixed(2) + '%'
      }))
    }
  };

  return detectionReport;
}

// ============================================
// 2. CURL COMMAND EXAMPLES
// ============================================

/**
 * Example CURL commands for API testing
 * 
 * Health Check:
 * ============
 * curl http://localhost:3000/helmet-detect/health
 * 
 * 
 * Detect Helmet in Image:
 * ======================
 * curl -X POST http://localhost:3000/helmet-detect/detect \
 *   -F "image=@/path/to/image.jpg"
 * 
 * 
 * Detect with Verbose Output:
 * ==========================
 * curl -v -X POST http://localhost:3000/helmet-detect/detect \
 *   -F "image=@test.jpg"
 * 
 * 
 * Save Response to File:
 * ====================
 * curl -X POST http://localhost:3000/helmet-detect/detect \
 *   -F "image=@test.jpg" \
 *   -o detection_result.json
 * 
 * 
 * Pretty Print Response:
 * ====================
 * curl -s -X POST http://localhost:3000/helmet-detect/detect \
 *   -F "image=@test.jpg" | jq '.'
 * 
 * 
 * Extract Decision Only:
 * ====================
 * curl -s -X POST http://localhost:3000/helmet-detect/detect \
 *   -F "image=@test.jpg" | jq '.detection.summary.decision'
 */

// ============================================
// 3. REACT NATIVE EXAMPLE
// ============================================

/**
 * React Native Hook for Helmet Detection
 * 
 * Usage:
 * const { detectHelmet, loading, error } = useHelmetDetection();
 * const result = await detectHelmet(imageUri);
 */

const useHelmetDetectionExample = () => {
  // This is pseudocode - implement according to your project structure
  const [loading, setLoading] = 'useState'(false);
  const [error, setError] = 'useState'(null);

  const detectHelmet = async (imageUri) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'helmet_detection.jpg'
      });

      const response = await fetch(
        'http://your-backend-url:3000/helmet-detect/detect',
        {
          method: 'POST',
          body: formData
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        helmetDetected: result.detection.summary.decision === 'helmet',
        violationDetected: result.detection.summary.decision === 'no-helmet',
        detections: result.detection.detections,
        confidence: result.detection.detections[0]?.confidence || 0,
        timestamp: result.timestamp
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { detectHelmet, loading, error };
};

// ============================================
// 4. TYPESCRIPT DEFINITIONS
// ============================================

/**
 * TypeScript type definitions for helmet detection API
 */

/*
interface HelmetDetectionResponse {
  success: boolean;
  image: {
    filename: string;
    path: string;
    size: number;
    mimetype: string;
  };
  detection: {
    detected_classes: string[];
    detection_count: number;
    detections: Detection[];
    summary: {
      helmet_count: number;
      no_helmet_count: number;
      decision: 'helmet' | 'no-helmet' | 'unknown';
    };
  };
  timestamp: string;
}

interface Detection {
  class: string;
  class_id: number;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  };
}

interface HealthCheckResponse {
  service: string;
  status: 'ready' | 'degraded' | 'offline';
  components: {
    model: {
      exists: boolean;
      path: string;
    };
    script: {
      exists: boolean;
      path: string;
    };
  };
  timestamp: string;
}
*/

// ============================================
// 5. ERROR HANDLING EXAMPLES
// ============================================

/**
 * Handle various error scenarios
 */
async function robustHelmetDetection(imagePath) {
  try {
    // Validate file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Check file size
    const stats = fs.statSync(imagePath);
    if (stats.size > 50 * 1024 * 1024) {
      throw new Error('Image file too large (max 50MB)');
    }

    // Perform detection
    const response = await detectHelmetFromFile(imagePath);

    // Validate response
    if (!response.success) {
      throw new Error(`Detection failed: ${response.error}`);
    }

    // Check for inference errors
    if (response.detection.detection_count === 0) {
      console.warn('No detections found - image may be unclear');
    }

    return response;

  } catch (error) {
    // Categorize errors
    if (error.code === 'ENOENT') {
      console.error('File not found error:', error.message);
    } else if (error.response?.status === 500) {
      console.error('Server error - check backend logs');
    } else if (error.response?.status === 400) {
      console.error('Bad request:', error.response.data);
    } else {
      console.error('Unknown error:', error.message);
    }

    throw error;
  }
}

// ============================================
// 6. PERFORMANCE MONITORING
// ============================================

/**
 * Track detection performance metrics
 */
class HelmetDetectionMonitor {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulDetections: 0,
      failedDetections: 0,
      averageResponseTime: 0,
      responseTimes: []
    };
  }

  async detectAndMonitor(imagePath) {
    const startTime = Date.now();

    try {
      this.metrics.totalRequests++;

      const result = await detectHelmetFromFile(imagePath);

      this.metrics.successfulDetections++;
      const responseTime = Date.now() - startTime;
      this.metrics.responseTimes.push(responseTime);
      this.updateAverageTime();

      return result;
    } catch (error) {
      this.metrics.failedDetections++;
      throw error;
    }
  }

  updateAverageTime() {
    const sum = this.metrics.responseTimes.reduce((a, b) => a + b, 0);
    this.metrics.averageResponseTime = (
      sum / this.metrics.responseTimes.length
    ).toFixed(2);
  }

  getReport() {
    return {
      ...this.metrics,
      successRate: (
        (this.metrics.successfulDetections / this.metrics.totalRequests * 100)
      ).toFixed(2) + '%'
    };
  }
}

// ============================================
// EXPORT FOR USE
// ============================================

module.exports = {
  detectHelmetFromFile,
  batchDetectHelmet,
  createHelmetDetectionMiddleware,
  processDetectionResponse,
  robustHelmetDetection,
  HelmetDetectionMonitor
};

// ============================================
// MAIN - Example Usage
// ============================================

if (require.main === module) {
  console.log('Helmet Detection API - Usage Examples\n');
  console.log('This file contains code examples for using the helmet detection API.');
  console.log('See comments above for different usage patterns.\n');

  console.log('Quick start:');
  console.log('1. Test health: curl http://localhost:3000/helmet-detect/health');
  console.log('2. Detect: curl -X POST http://localhost:3000/helmet-detect/detect -F "image=@test.jpg"');
  console.log('3. See HELMET_DETECTION.md for full documentation');
}
