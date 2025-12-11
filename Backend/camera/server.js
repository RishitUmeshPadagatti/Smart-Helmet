const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Port configuration
const PORT = process.env.PORT || 3001;

// ========== CORS Configuration ==========
// Allow requests from React Native app and other frontends
const corsOptions = {
  origin: function (origin, callback) {
    // Allow localhost and any origin on port 8081 (React Native dev)
    const allowedOrigins = [
      'http://localhost:8081',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://0.0.0.0:8081',
      'http://127.0.0.1:8081',
      'http://192.168.1.100:8081',  // Change to your IP
    ];
    
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// ========== Camera Stream Storage ==========
// Store active camera streams in memory
let cameraStream = {
  isActive: false,
  frameBuffer: null,
  timestamp: null,
};

// ========== Routes ==========

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Camera Streaming Server',
    timestamp: new Date().toISOString(),
    cameraActive: cameraStream.isActive,
  });
});

// Start camera stream
app.post('/camera/start', (req, res) => {
  if (cameraStream.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Camera stream already active',
    });
  }

  cameraStream.isActive = true;
  cameraStream.timestamp = new Date().toISOString();

  // In a real scenario, this would connect to your camera hardware
  // For now, this starts the camera service

  console.log('✓ Camera stream started at', cameraStream.timestamp);

  res.json({
    success: true,
    message: 'Camera stream started',
    timestamp: cameraStream.timestamp,
    streamUrl: '/camera/stream',
  });
});

// Stop camera stream
app.post('/camera/stop', (req, res) => {
  if (!cameraStream.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Camera stream not active',
    });
  }

  cameraStream.isActive = false;
  cameraStream.frameBuffer = null;

  console.log('✓ Camera stream stopped');

  res.json({
    success: true,
    message: 'Camera stream stopped',
  });
});

// Get camera status
app.get('/camera/status', (req, res) => {
  res.json({
    isActive: cameraStream.isActive,
    startedAt: cameraStream.timestamp,
    frameBufferSize: cameraStream.frameBuffer ? cameraStream.frameBuffer.length : 0,
  });
});

// Upload frame from camera (for real camera hardware)
app.post('/camera/frame', (req, res) => {
  const { frameData, timestamp } = req.body;

  if (!frameData) {
    return res.status(400).json({
      success: false,
      message: 'frameData is required',
    });
  }

  // Store frame in buffer
  cameraStream.frameBuffer = frameData;
  cameraStream.timestamp = timestamp || new Date().toISOString();

  res.json({
    success: true,
    message: 'Frame received',
    frameId: uuidv4(),
  });
});

// Get latest frame
app.get('/camera/frame', (req, res) => {
  if (!cameraStream.isActive || !cameraStream.frameBuffer) {
    return res.status(404).json({
      success: false,
      message: 'No frame available',
    });
  }

  res.json({
    success: true,
    frameData: cameraStream.frameBuffer,
    timestamp: cameraStream.timestamp,
  });
});

// Simulate camera feed for testing (MJPEG stream)
app.get('/camera/mjpeg', (req, res) => {
  if (!cameraStream.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Camera stream not active',
    });
  }

  // Set MJPEG headers
  res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=--myboundary');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Send a test frame (in production, this would stream actual camera data)
  const sendFrame = () => {
    if (!cameraStream.isActive) {
      res.end();
      return;
    }

    // This is a simple 1x1 JPEG for testing
    const testFrame = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
      0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c,
      0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d,
      0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
      0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
      0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34,
      0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4,
      0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
      0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
      0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff,
      0xc4, 0x00, 0xb5, 0x10, 0x00, 0x02, 0x01, 0x03,
      0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04,
      0x00, 0x00, 0x01, 0x7d, 0x01, 0x02, 0x03, 0x00,
      0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
      0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32,
      0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1,
      0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72,
      0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a,
      0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35,
      0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45,
      0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55,
      0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65,
      0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75,
      0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85,
      0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94,
      0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3,
      0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2,
      0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba,
      0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9,
      0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8,
      0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6,
      0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4,
      0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda,
      0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
      0xfb, 0xd0, 0xff, 0xd9,
    ]);

    res.write(`--myboundary\r\nContent-Type: image/jpeg\r\nContent-Length: ${testFrame.length}\r\n\r\n`);
    res.write(testFrame);
    res.write('\r\n');

    // Send next frame every 33ms (30 FPS)
    setTimeout(sendFrame, 33);
  };

  sendFrame();
});

// Websocket-like frame streaming via SSE
app.get('/camera/sse', (req, res) => {
  if (!cameraStream.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Camera stream not active',
    });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send frame updates
  const frameInterval = setInterval(() => {
    if (!cameraStream.isActive) {
      clearInterval(frameInterval);
      res.end();
      return;
    }

    const frameData = cameraStream.frameBuffer || 'no_frame';
    res.write(`data: ${JSON.stringify({
      frame: frameData,
      timestamp: cameraStream.timestamp,
    })}\n\n`);
  }, 33);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(frameInterval);
    res.end();
  });
});

// Get all endpoints
app.get('/endpoints', (req, res) => {
  res.json({
    endpoints: {
      health: 'GET /health',
      startCamera: 'POST /camera/start',
      stopCamera: 'POST /camera/stop',
      cameraStatus: 'GET /camera/status',
      uploadFrame: 'POST /camera/frame',
      getLatestFrame: 'GET /camera/frame',
      mjpegStream: 'GET /camera/mjpeg',
      sseStream: 'GET /camera/sse',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: 'GET /endpoints',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// ========== Server Start ==========
server.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  Camera Streaming Server Running      ║`);
  console.log(`║  Port: ${PORT}${' '.repeat(31 - PORT.toString().length)}║`);
  console.log(`║  URL: http://localhost:${PORT}${' '.repeat(18 - PORT.toString().length)}║`);
  console.log(`║  Status: Ready for camera connection  ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
  console.log('Available endpoints:');
  console.log(`  GET  /health              - Health check`);
  console.log(`  POST /camera/start        - Start camera stream`);
  console.log(`  POST /camera/stop         - Stop camera stream`);
  console.log(`  GET  /camera/status       - Get camera status`);
  console.log(`  POST /camera/frame        - Upload frame from camera`);
  console.log(`  GET  /camera/frame        - Get latest frame`);
  console.log(`  GET  /camera/mjpeg        - MJPEG stream (for video players)`);
  console.log(`  GET  /camera/sse          - SSE stream (for real-time updates)`);
  console.log(`\nAPI Docs: GET /endpoints\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
