// src/server.js

require('express-async-errors');
require('dotenv').config();

const express = require('express');
const path = require('path');
const { corsMiddleware } = require('./middleware');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for processed results
const processedFolder = path.join(__dirname, '..', 'processed');
app.use('/results', express.static(processedFolder));

// Serve static files for outputs (annotated videos, frames, garbage images)
const outputsFolder = path.join(__dirname, '..', 'outputs');
app.use('/outputs', express.static(outputsFolder));

// ============================================
// Request Logging
// ============================================
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// Routes
// ============================================
app.use('/', routes);

// ============================================
// ESP32 Serial Data Handling (Read from USB)
// ============================================
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let latestEsp32Data = {
  latitude: '...',
  longitude: '...',
  altitude: '0.00',
  speed: '0.00',
  accelX: '0.00',
  accelY: '0.00',
  accelZ: '0.00',
  aqi: '...',
  fall: 'false'
};

async function startSerialListener() {
  try {
    const ports = await SerialPort.list();
    console.log('[SerialPort] Available ports:', ports.map(p => p.path));

    const espPort = ports.find(p => p.path.toLowerCase().includes('usb') || p.path.includes('ttyACM') || p.path.includes('SLAB'));
    
    if (espPort) {
      console.log(`[SerialPort] Found ESP32 port: ${espPort.path}`);
      const port = new SerialPort({ path: espPort.path, baudRate: 115200 });
      const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

      parser.on('data', (data) => {
        let rawLine = data.toString().trim();
        
        // Log the incoming data so we can see it in standard output
        console.log("[ESP32 Raw] >>", rawLine);
        
        // Remove Arduino IDE prefix if present (e.g. "02:39:59.541 -> ")
        const jsonStart = rawLine.indexOf('{');
        if (jsonStart !== -1) {
          rawLine = rawLine.substring(jsonStart);
        }

        try {
          const parsed = JSON.parse(rawLine);
          if (parsed.lat !== undefined) {
            latestEsp32Data.latitude = String(parsed.lat);
            latestEsp32Data.longitude = String(parsed.lon);
            latestEsp32Data.altitude = String(parsed.alt);
            latestEsp32Data.speed = String(parsed.speed);
            
            if (parsed.acc) {
              latestEsp32Data.accelX = String(parsed.acc.x);
              latestEsp32Data.accelY = String(parsed.acc.y);
              latestEsp32Data.accelZ = String(parsed.acc.z);
            }
            
            if (parsed.aqi) {
              latestEsp32Data.aqi = String(parsed.aqi.value);
            }
            
            if (parsed.fall !== undefined) {
              latestEsp32Data.fall = String(parsed.fall);
            }
            
            // Console log on successful parse (optional, but helpful for debugging)
            // console.log("[ESP32 Parsed]", latestEsp32Data);
          }
        } catch(e) {
          // Ignore invalid JSON lines
        }
      });

      port.on('error', (err) => {
        console.error('[SerialPort] Connection Error:', err.message);
      });
    } else {
      console.log('[SerialPort] No compatible USB serial port found. Check connections.');
    }
  } catch (err) {
    console.error('[SerialPort] List error:', err);
  }
}
startSerialListener();

// Endpoints for Dashboard
app.get('/esp32-data', (req, res) => res.json(latestEsp32Data));
app.get('/altitude', (req, res) => res.send(latestEsp32Data.altitude));
app.get('/speed', (req, res) => res.send(latestEsp32Data.speed));
app.get('/aqi', (req, res) => res.send(latestEsp32Data.aqi));
app.get('/acceleration', (req, res) => {
  res.json({
    x: latestEsp32Data.accelX,
    y: latestEsp32Data.accelY,
    z: latestEsp32Data.accelZ
  });
});
app.get('/latitude', (req, res) => res.send(latestEsp32Data.latitude));
app.get('/longitude', (req, res) => res.send(latestEsp32Data.longitude)); // Fixed missing parenthesis

// ============================================
// Error Handling
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message && err.message.includes('File type not allowed')) {
    return res.status(400).json({ error: err.message });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// ============================================
// Webcam Stream Handling (WebSocket port 8080)
// ============================================
const { WebSocketServer } = require('ws');
const { spawn } = require('child_process');
const readline = require('readline');

const wss = new WebSocketServer({ port: 8080 });
console.log('✓ WebSocket server started on port 8080 for live webcam stream');

const pythonScriptPath = path.join(__dirname, 'webcam.py');
const pythonExecutable = path.join(__dirname, '..', 'venv', 'bin', 'python');
let webcamProcess = spawn(pythonExecutable, [pythonScriptPath]);

const rl = readline.createInterface({
  input: webcamProcess.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line || wss.clients.size === 0) return;
  try {
    const frameBuffer = Buffer.from(line, 'base64');
    wss.clients.forEach((client) => {
      // readyState 1 is WebSocket.OPEN
      if (client.readyState === 1) {
        client.send(frameBuffer);
      }
    });
  } catch (error) {
    // Ignore occasional decoding errors
  }
});

webcamProcess.stderr.on('data', (data) => {
  console.error(`[Webcam Script Error]: ${data}`);
});

webcamProcess.on('close', (code) => {
  console.log(`[Webcam Script] exited with code ${code}`);
});

// ============================================
// Server Startup
// ============================================
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Smart Helmet Backend API Server       ║
╚════════════════════════════════════════╝
`);
  console.log(`✓ Server started at: http://localhost:${PORT}`);
  console.log(`✓ API Documentation: http://localhost:${PORT}/health`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Timestamp: ${new Date().toISOString()}\n`);
});

// Graceful shutdown
function shutdownServers() {
  console.log('Closing servers and ending child processes...');
  if (webcamProcess) webcamProcess.kill();
  wss.close();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  shutdownServers();
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  shutdownServers();
});

module.exports = app;
