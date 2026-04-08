const express = require('express');
const os = require('os');

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

// -------- 15 Fake Data Values --------
const fakeDataset = [
  { speed: 0, aqi: 45, latitude: 13.0827, longitude: 80.2707 },
  { speed: 0, aqi: 50, latitude: 13.0827, longitude: 80.2707 },
  { speed: 0, aqi: 55, latitude: 13.0827, longitude: 80.2717 },
  { speed: 0, aqi: 60, latitude: 13.0827, longitude: 80.2717 },
  { speed: 0, aqi: 65, latitude: 13.0827, longitude: 80.2717 },
  { speed: 0, aqi: 70, latitude: 13.0827, longitude: 80.2717 },
  { speed: 0, aqi: 75, latitude: 13.0827, longitude: 80.2717 },
  { speed: 0, aqi: 80, latitude: 13.0827, longitude: 80.2727 },
  { speed: 0, aqi: 85, latitude: 13.0827, longitude: 80.2727 },
  { speed: 0, aqi: 90, latitude: 13.0827, longitude: 80.2727 },
  { speed: 0, aqi: 95, latitude: 13.0827, longitude: 80.2727 },
  { speed: 0, aqi: 100, latitude: 13.0849, longitude: 80.27229 },
  { speed: 0, aqi: 105, latitude: 13.0849, longitude: 80.27329 },
  { speed: 0, aqi: 110, latitude: 13.0849, longitude: 80.27329 },
  { speed: 0,  aqi: 115, latitude: 13.0849, longitude: 80.27329 },
];

// -------- Latest Data Object --------
let latestData = {
  speed: null,
  aqi: null,
  latitude: null,
  longitude: null,
  lastUpdated: null,
};

let index = 0;

// -------- Cycle Fake Data Every 1 Second --------
setInterval(() => {
  latestData = {
    ...fakeDataset[index],
    lastUpdated: new Date().toISOString(),
  };

  console.log("Fake Data:", latestData);

  index = (index + 1) % fakeDataset.length;
}, 1000);

// -------- API Endpoints --------
app.get('/data', (req, res) => {
  res.json(latestData);
});

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