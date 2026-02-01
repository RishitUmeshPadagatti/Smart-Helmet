const express = require('express');
const os = require('os');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = 3000;

// -------- Get Raspberry Pi Local IP --------
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PI_IP = getLocalIP();

// -------- Latest values from ESP32 --------
let latestData = {
  speed: null,
  aqi: null,
  latitude: null,
  longitude: null,
  lastUpdated: null,
};

// -------- Open UART (/dev/serial0) --------
const port = new SerialPort({
  path: '/dev/serial0',
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

console.log("Waiting for ESP32 data...\n");

// -------- Serial Port Error Handling --------
port.on('open', () => {
  console.log("Serial port opened successfully.");
});

port.on('error', (err) => {
  console.error("Serial Port Error:", err.message);
});

// -------- Parse incoming ESP32 line --------
// Expected format:
// SPD=12.5,AQI=85,LAT=13.0827,LON=80.2707
parser.on('data', (line) => {
  line = line.trim();
  console.log("ESP32:", line);

  try {
    const parts = Object.fromEntries(
      line.split(',').map(p => p.split('='))
    );

    if (parts.SPD) latestData.speed = parseFloat(parts.SPD);
    if (parts.AQI) latestData.aqi = parseInt(parts.AQI);

    latestData.latitude =
      parts.LAT && parts.LAT !== 'NA' ? parseFloat(parts.LAT) : null;

    latestData.longitude =
      parts.LON && parts.LON !== 'NA' ? parseFloat(parts.LON) : null;

    latestData.lastUpdated = new Date().toISOString();

  } catch (err) {
    console.log("Parse error:", err.message);
  }
});

// -------- API Endpoints --------

// Combined endpoint (recommended for frontend)
app.get('/data', (req, res) => {
  res.json(latestData);
});

// Individual endpoints → RAW values
app.get('/speed', (req, res) => {
  res.send(String(latestData.speed ?? 'NA'));
});

app.get('/aqi', (req, res) => {
  res.send(String(latestData.aqi ?? 'NA'));
});

app.get('/latitude', (req, res) => {
  res.send(String(latestData.latitude ?? 'NA'));
});

app.get('/longitude', (req, res) => {
  res.send(String(latestData.longitude ?? 'NA'));
});

// -------- Start Server --------
app.listen(PORT, () => {
  console.log(`\nServer running at http://${PI_IP}:${PORT}`);
  console.log(`Try: http://${PI_IP}:${PORT}/data\n`);
});