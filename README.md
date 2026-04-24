<p align="center">
  <h1 align="center">🪖 Smart Helmet — Intelligent Road Safety System</h1>
  <p align="center">
    An end-to-end IoT-powered smart helmet platform combining <strong>ESP32 sensors</strong>, <strong>Raspberry Pi edge computing</strong>, <strong>AI/ML video analysis</strong>, and a <strong>React Native mobile app</strong> for real-time rider safety monitoring, traffic violation detection, and emergency response.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white" alt="Expo SDK 54" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/ESP32-Firmware-E7352C?logo=espressif&logoColor=white" alt="ESP32" />
  <img src="https://img.shields.io/badge/YOLOv8-ML-FF6F00?logo=python&logoColor=white" alt="YOLOv8" />
  <img src="https://img.shields.io/badge/TensorFlow-Keras-FF6F00?logo=tensorflow&logoColor=white" alt="TensorFlow" />
  <img src="https://img.shields.io/badge/Raspberry%20Pi-Edge-C51A4A?logo=raspberrypi&logoColor=white" alt="Raspberry Pi" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Mobile App Setup](#2-mobile-app-setup)
  - [Hardware Setup](#3-hardware-setup-esp32)
  - [Raspberry Pi Setup](#4-raspberry-pi-setup)
- [API Reference](#-api-reference)
- [ML Models](#-ml-models)
- [Mobile App Screens](#-mobile-app-screens)
- [Voice Assistant](#-voice-assistant)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Team](#-team)

---

## 🔭 Overview

Smart Helmet is a comprehensive road safety platform built for **JSS Ideathon 2025**. It transforms a standard helmet into an intelligent safety device capable of:

- **Real-time telemetry** — GPS, accelerometer, altitude, and speed monitoring via ESP32 sensors
- **Fall/crash detection** — Automatic impact detection with emergency SOS alerts and AI-powered phone calls
- **Traffic violation detection** — YOLOv8-based helmet-wearing detection with license plate extraction via EasyOCR
- **Garbage/waste detection** — TensorFlow/MobileNet binary classifier for roadside waste identification
- **Pothole detection** — Road hazard identification and reporting
- **Live camera feed** — WebSocket-based real-time video streaming from the helmet camera
- **Voice assistant** — Offline speech recognition (Vosk) + Gemini AI conversational assistant
- **Incident reporting** — Email-based reports with annotated frames and violation evidence

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          SMART HELMET DEVICE                            │
│                                                                         │
│   ┌──────────┐    UART     ┌───────────────┐    WiFi     ┌──────────┐  │
│   │  ESP32   │ ──────────▶ │ Raspberry Pi  │ ──────────▶ │ Backend  │  │
│   │          │             │               │             │ (Node.js)│  │
│   │ • MPU6050│             │ • Camera      │    HTTP     │          │  │
│   │ • GPS    │             │ • Voice Asst. │ ◀────────── │ • ML     │  │
│   │ • MQ135  │             │ • Sensor Relay│             │ • YOLO   │  │
│   │ • MQ7    │             │ • BT Speaker  │             │ • OCR    │  │
│   └──────────┘             └───────────────┘             └────┬─────┘  │
│                                                                │        │
└─────────────────────────────────────────────────────────────────│────────┘
                                                                 │
                                                                 │ REST API
                                                                 │ WebSocket
                                                                 ▼
                                                     ┌───────────────────┐
                                                     │  Mobile App       │
                                                     │  (React Native)   │
                                                     │                   │
                                                     │ • Dashboard       │
                                                     │ • Traffic Mgmt    │
                                                     │ • Waste Detection │
                                                     │ • Pothole Reports │
                                                     │ • Impact Analysis │
                                                     │ • Live Camera     │
                                                     │ • SOS Alerts      │
                                                     └───────────────────┘
```

---

## ✨ Features

| Category | Feature | Status |
|----------|---------|--------|
| **Sensors** | Real-time GPS, accelerometer, altitude, speed via ESP32 | ✅ |
| **Safety** | Automatic fall/crash detection (MPU6050 threshold > 2.5g) | ✅ |
| **Safety** | One-tap SOS with AI-powered emergency phone call (VAPI) | ✅ |
| **Safety** | SMS on crash to emergency contacts | ✅ |
| **ML** | Helmet violation detection (YOLOv8 custom model) | ✅ |
| **ML** | Vehicle detection & threat scoring (YOLOv8s) | ✅ |
| **ML** | License plate extraction (EasyOCR / PaddleOCR) | ✅ |
| **ML** | Garbage/waste classification (TensorFlow/MobileNet) | ✅ |
| **Video** | Live webcam streaming via WebSocket (MJPEG) | ✅ |
| **Video** | Video upload & annotated output with bounding boxes | ✅ |
| **Voice** | Offline speech recognition (Vosk, Indian English model) | ✅ |
| **Voice** | Gemini AI conversational assistant with key rotation | ✅ |
| **Voice** | Media playback control (play, pause, resume via VLC) | ✅ |
| **App** | Real-time dashboard with live telemetry cards | ✅ |
| **App** | Interactive location map (Leaflet / React Native Maps) | ✅ |
| **App** | Dark mode / light mode toggle | ✅ |
| **App** | Incident email reports with annotated evidence | ✅ |
| **App** | Family member management & notifications | ✅ |
| **Infra** | Raspberry Pi ↔ ESP32 UART bridge | ✅ |
| **Infra** | USB serial auto-detection for ESP32 | ✅ |

---

## 📁 Project Structure

```
Smart-Helmet/
│
├── Backend-JS/                    # Node.js/Express backend server
│   ├── src/
│   │   ├── server.js              # Express entry point + serial + WebSocket
│   │   ├── routes/
│   │   │   ├── index.js           # Route mounting
│   │   │   ├── videoAnalysis.js   # POST /api/video-analysis
│   │   │   ├── garbageRoutes.js   # POST /api/garbage-image-check
│   │   │   ├── helmet.js          # POST /helmet-detect/detect
│   │   │   ├── sensors.js         # Sensor data CRUD
│   │   │   ├── users.js           # User management
│   │   │   ├── video.js           # Video upload/download
│   │   │   └── report.js          # Email report sending
│   │   ├── utils/
│   │   │   ├── dual_model_ml_service.py    # Helmet + vehicle YOLO pipeline
│   │   │   ├── detect_garbage_frame.py     # TensorFlow garbage classifier
│   │   │   ├── easyocr_plate_extractor.py  # License plate OCR
│   │   │   ├── annotate_video_with_plate.py
│   │   │   ├── email.js                    # Nodemailer email service
│   │   │   ├── garbageDetectionProcessor.js
│   │   │   ├── videoProcessor.js
│   │   │   └── storage.js
│   │   ├── middleware/             # CORS, error handling
│   │   └── webcam.py              # Python webcam capture for WebSocket
│   ├── ML_model/
│   │   ├── helmet_best.pt         # YOLOv8 helmet detection (custom trained)
│   │   ├── yolov8s.pt             # YOLOv8 vehicle detection
│   │   ├── garbage_classifier.keras  # TensorFlow/MobileNet garbage model
│   │   └── requirements.txt       # Python ML dependencies
│   ├── outputs/                   # Processed videos, frames, garbage images
│   ├── uploads/                   # Temporary file storage
│   ├── data/                      # Persistent data (users, sensors)
│   ├── package.json
│   ├── requirements.txt           # Python dependencies (torch, ultralytics, etc.)
│   ├── nodemon.json
│   └── .env.example
│
├── SmartHelmetApp/                # React Native (Expo) mobile app
│   ├── app/
│   │   ├── tabs/
│   │   │   ├── _layout.tsx        # Tab navigator (6 tabs)
│   │   │   ├── dashboard.tsx      # Real-time sensor dashboard
│   │   │   ├── traffic.tsx        # Traffic violation management
│   │   │   ├── waste.tsx          # Garbage detection reports
│   │   │   ├── potholes.tsx       # Pothole detection reports
│   │   │   ├── impact.tsx         # Impact/crash analysis
│   │   │   ├── settings.tsx       # User settings & preferences
│   │   │   └── location.tsx       # GPS map view
│   │   ├── traffic/               # Traffic incident detail screens
│   │   ├── waste/                 # Waste incident detail screens
│   │   ├── potholes/              # Pothole detail screens
│   │   ├── impact/                # Impact detail screens
│   │   ├── incident/              # General incident screens
│   │   ├── live-cam.tsx           # WebSocket live camera feed
│   │   ├── _layout.tsx            # Root layout
│   │   └── hooks/                 # Custom hooks (useUserData, etc.)
│   ├── components/
│   │   ├── SOSButton.tsx          # Emergency SOS trigger
│   │   ├── AlertDialog.tsx        # Connection status alerts
│   │   ├── LocationMap.tsx        # Native map component
│   │   ├── LocationMap.web.tsx    # Web Leaflet map component
│   │   ├── ZoomableImage.tsx      # Pinch-to-zoom image viewer
│   │   ├── AddFamilyMemberModal.tsx
│   │   └── ...                    # Button, Card, Badge, Text, Header, etc.
│   ├── config/
│   │   └── api.ts                 # Backend IP/port configuration
│   ├── context/                   # React context (UserContext)
│   ├── constants/                 # App constants (IP addresses, tokens)
│   ├── lib/                       # Mock data, utilities
│   ├── assets/                    # Images, fonts
│   ├── app.json                   # Expo configuration
│   ├── tailwind.config.js         # NativeWind/Tailwind config
│   └── package.json
│
├── Hardware/
│   └── esp32.ino                  # ESP32 firmware (MPU6050, GPS, AQI, UART)
│
├── Raspberry Pi/
│   ├── voice_assistant/
│   │   ├── main.py                # Vosk + Gemini voice assistant
│   │   ├── .env                   # Gemini API keys
│   │   └── requirements.txt
│   ├── camera-stream/
│   │   └── server.js              # FFmpeg → WebSocket MJPEG stream
│   ├── sending-sensor-data/
│   │   └── server.js              # Sensor data relay API
│   ├── BluetoothSpeakerAndMic/    # Bluetooth audio config
│   ├── MultipleNetworks/          # Network configuration
│   └── Raspberry Pi Connect/      # Remote access setup
│
├── Sending Data Over Mac/         # Development utilities for local testing
│   ├── Camera Streaming/          # macOS webcam streaming
│   └── Sensor Data/               # Simulated sensor data
│
├── .gitignore
└── README.md
```

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server, static file serving |
| **SerialPort** | USB serial communication with ESP32 |
| **WebSocket (ws)** | Real-time camera streaming |
| **Multer** | File upload handling |
| **Nodemailer** | Email incident reports |
| **Sharp** | Image processing |

### ML / AI (Python)
| Technology | Purpose |
|-----------|---------|
| **YOLOv8 (Ultralytics)** | Helmet & vehicle detection |
| **TensorFlow/Keras** | Garbage classification (MobileNet) |
| **EasyOCR / PaddleOCR** | License plate text extraction |
| **OpenCV** | Video frame processing |
| **PyTorch** | ML model inference |

### Mobile App
| Technology | Purpose |
|-----------|---------|
| **React Native (Expo SDK 54)** | Cross-platform mobile app |
| **Expo Router v6** | File-based routing |
| **NativeWind (TailwindCSS)** | Styling |
| **Axios** | HTTP client |
| **AsyncStorage** | Local data persistence |
| **React Native Maps + Leaflet** | Native & web map rendering |
| **Lucide Icons** | UI iconography |

### Hardware
| Component | Purpose |
|-----------|---------|
| **ESP32** | Microcontroller for sensor fusion |
| **MPU6050** | 6-axis accelerometer/gyroscope |
| **MQ135 + MQ7** | Air quality sensing |
| **GPS Module** | Location tracking |
| **Raspberry Pi** | Edge computing, camera, voice assistant |
| **USB Webcam** | Live video capture |

### Voice Assistant
| Technology | Purpose |
|-----------|---------|
| **Vosk** | Offline speech recognition (Indian English) |
| **Google Gemini 2.5 Flash** | AI conversational responses |
| **VLC** | Media playback |
| **espeak / macOS `say`** | Text-to-speech |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12 (required for TensorFlow 2.20)
- **Git**
- **Arduino IDE** (for ESP32 firmware flashing)
- macOS / Linux / Windows

### 1. Backend Setup

```bash
# Clone the repository
git clone https://github.com/RishitUmeshPadagatti/Smart-Helmet.git
cd Smart-Helmet/Backend-JS

# Install Node.js dependencies
npm install

# Create Python virtual environment for ML processing
python3.12 -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# Install Python ML dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start the backend server
npm run dev                        # Development (with auto-reload)
# npm start                       # Production
```

The server will start on `http://localhost:3000` with a WebSocket server on port `8080`.

### 2. Mobile App Setup

```bash
cd Smart-Helmet/SmartHelmetApp

# Install dependencies
npm install

# Configure backend IP address
# Edit constants/values.ts and set piIpAddress to your backend's IP

# Start the Expo dev server
npm start

# Or target a specific platform
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Web Browser
```

### 3. Hardware Setup (ESP32)

1. Open `Hardware/esp32.ino` in Arduino IDE
2. Install the required libraries:
   - **Wire** (built-in)
   - **ArduinoJson** (via Library Manager)
3. Configure the board: **ESP32 Dev Module**
4. Set serial baud rate to **115200**
5. Upload the firmware to the ESP32
6. Connect the ESP32 via USB to the Raspberry Pi or backend machine

**Sensor wiring:**
| Sensor | ESP32 Pin |
|--------|-----------|
| MPU6050 SDA | GPIO 21 |
| MPU6050 SCL | GPIO 22 |
| MQ135 Analog | GPIO 34 |
| MQ7 Analog | GPIO 35 |
| UART TX (to Pi) | GPIO 25 |

### 4. Raspberry Pi Setup

#### Voice Assistant
```bash
cd "Raspberry Pi/voice_assistant"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Gemini API keys
cp .env.example .env
# Add your Gemini API key(s) to .env

# Run the voice assistant
python main.py
```

The Vosk Indian English model (`vosk-model-en-in-0.5`) will auto-download on first run.

#### Camera Stream
```bash
cd "Raspberry Pi/camera-stream"
npm install ws
node server.js
```

Requires `ffmpeg` installed and a USB webcam at `/dev/video0`.

#### Sensor Data Relay
```bash
cd "Raspberry Pi/sending-sensor-data"
npm install express
node server.js
```

---

## 📡 API Reference

### Health & Root

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info and available endpoints |
| `GET` | `/health` | Server status and timestamp |

### ESP32 Live Telemetry

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/esp32-data` | Full telemetry JSON (lat, lon, alt, speed, accel, aqi, fall) |
| `GET` | `/latitude` | Current latitude |
| `GET` | `/longitude` | Current longitude |
| `GET` | `/altitude` | Current altitude (meters) |
| `GET` | `/speed` | Current speed (m/s) |
| `GET` | `/acceleration` | Accelerometer data `{x, y, z}` |
| `GET` | `/aqi` | Air quality index |

### Video Analysis (Traffic Violations)

```
POST /api/video-analysis
Content-Type: multipart/form-data
Field: video (MP4, AVI, MOV, MKV, WEBM — max 500MB)
```

**Response:**
```json
{
  "success": true,
  "video_id": "uuid",
  "annotated_video": "/outputs/{id}/annotated_video.mp4",
  "helmet_detection": {
    "violations_count": 5,
    "best_frame": "/outputs/{id}/best_frame.jpg"
  },
  "vehicle_threats": {
    "threats_count": 3
  },
  "license_plate": "KL09AQ3439",
  "processing_time_seconds": 45.2
}
```

### Garbage Detection

```
POST /api/garbage-image-check
Content-Type: multipart/form-data
Field: image (JPEG, PNG — max 10MB)
```

**Response:**
```json
{
  "success": true,
  "garbage_detected": true,
  "confidence": 0.96,
  "processed_image_path": "/outputs/garbage/image_xxx.jpg",
  "timestamp": "2026-01-31T12:00:00.000Z"
}
```

### Helmet Detection (Direct)

```
POST /helmet-detect/detect
Content-Type: multipart/form-data
Field: image
```

### Email Reports

```
POST /api/send-report
Content-Type: application/json
```

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | List all users |
| `GET` | `/users/:id` | Get user by ID |
| `POST` | `/users/:id` | Create/update user |
| `PATCH` | `/users/:id` | Partially update user |

### Sensor Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/sensors/upload` | Receive sensor data from ESP32 |
| `GET` | `/sensors/latest` | Get latest sensor reading |
| `GET` | `/sensors/history?limit=20` | Get sensor history |
| `DELETE` | `/sensors/history` | Clear sensor history |

### Static Files

| Path | Content |
|------|---------|
| `/outputs/*` | Annotated videos, best frames, garbage images |
| `/results/*` | Processed video results |

---

## 🤖 ML Models

| Model | File | Framework | Purpose | Input |
|-------|------|-----------|---------|-------|
| Helmet Detection | `helmet_best.pt` | YOLOv8 (Custom) | Detect helmet / no-helmet on riders | Video frames |
| Vehicle Detection | `yolov8s.pt` | YOLOv8 (Pre-trained) | Detect cars, motorcycles, trucks | Video frames |
| Garbage Classifier | `garbage_classifier.keras` | TensorFlow/MobileNet | Binary garbage detection | 224×224 images |
| License Plate OCR | EasyOCR / PaddleOCR | — | Extract text from license plates | Cropped plate images |

### Processing Pipelines

**Traffic Violation Analysis:**
1. Upload video → `/api/video-analysis`
2. Extract frames using OpenCV
3. Run YOLOv8 helmet detection on each frame
4. Run YOLOv8 vehicle detection for threat analysis
5. Extract license plate using OCR on best violation frame
6. Generate annotated video with bounding boxes
7. Return URLs to annotated video and best frame

**Garbage Detection:**
1. Upload image → `/api/garbage-image-check`
2. Resize to 224×224 for MobileNet input
3. Run TensorFlow binary classifier
4. If garbage detected (confidence > 0.5), generate annotated image
5. Return detection result with confidence and annotated image URL

---

## 📱 Mobile App Screens

| Tab | Screen | Description |
|-----|--------|-------------|
| 🏠 | **Dashboard** | Live telemetry (altitude, speed, acceleration), SOS button, coordinates |
| 🚗 | **Traffic** | Upload dashcam video → helmet violation analysis with annotated results |
| 🗑 | **Waste** | Upload images → garbage detection with confidence scores |
| ⚠️ | **Potholes** | Upload road footage → pothole/hazard detection reports |
| 📊 | **Impact** | Crash/impact incident log with severity, g-force, and video playback |
| ⚙️ | **Settings** | Profile editing, dark mode, auto-SOS toggle, family member management |
| 📍 | **Location** | Interactive GPS map (Leaflet for web, React Native Maps for native) |
| 📷 | **Live Cam** | Real-time WebSocket video feed from helmet camera |

---

## 🎙 Voice Assistant

The Raspberry Pi runs an offline voice assistant (`MAX`) powered by:

- **Vosk** — Offline speech-to-text with the Indian English model (`vosk-model-en-in-0.5`)
- **Gemini 2.5 Flash** — Cloud-based AI for conversational responses
- **VLC** — Media playback control

### Voice Commands

| Command | Action |
|---------|--------|
| `"Hey Max"` | Wake greeting |
| `"Play"` / `"Resume"` | Start/resume media playback |
| `"Pause"` / `"Stop"` | Pause media playback |
| `"Hello"` | Simple greeting |
| Any other phrase | Routed to Gemini AI for intelligent response |

### Key Features
- **API key rotation**: Supports up to 3 Gemini API keys with automatic failover on quota errors (429) or service unavailability (503)
- **Anti-feedback loop**: Clears microphone buffer during TTS to prevent self-hearing
- **Cross-platform TTS**: Uses `say` on macOS, `espeak` on Linux/Raspberry Pi

---

## 🔐 Environment Variables

### Backend (`Backend-JS/.env`)

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
MAX_FILE_SIZE=500000000
API_VERSION=1.0.0
API_TITLE=Smart Helmet Backend
```

### Voice Assistant (`Raspberry Pi/voice_assistant/.env`)

```env
GEMINI_API_KEY1=your_gemini_api_key_1
GEMINI_API_KEY2=your_gemini_api_key_2
GEMINI_API_KEY3=your_gemini_api_key_3
```

### Mobile App (`SmartHelmetApp/constants/values.ts`)

Configure the backend IP address in the constants file:
```typescript
export const piIpAddress = "192.168.1.157";   // Your backend machine IP
```

---

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Test ESP32 Live Data

```bash
curl http://localhost:3000/esp32-data
```

### Test Video Analysis

```bash
curl -X POST http://localhost:3000/api/video-analysis \
  -F "video=@/path/to/video.mp4"
```

### Test Garbage Detection

```bash
curl -X POST http://localhost:3000/api/garbage-image-check \
  -F "image=@/path/to/image.jpg"
```

### Test Sensor Upload

```bash
curl -X POST http://localhost:3000/sensors/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sos": false,
    "rfid": "RF123",
    "accel": [0, 0, 0],
    "gyro": [0, 0, 0],
    "gps_fix": false,
    "gps": "",
    "mq3_v": 0.03,
    "turb_raw": 1535,
    "ultrasonic_cm": -1,
    "button": false
  }'
```

---

## 🐛 Troubleshooting

### Backend Issues

| Problem | Solution |
|---------|----------|
| `ModuleNotFoundError: No module named 'torch'` | Activate venv and run `pip install -r requirements.txt` |
| `SerialPort: No compatible USB serial port found` | Check ESP32 USB connection; install drivers if needed |
| 500 on video upload | Ensure `outputs/` and `uploads/` directories exist |
| `yolov8s.pt` not found | Download model to `ML_model/` directory |
| CORS errors | Backend allows all origins in development mode |

### Mobile App Issues

| Problem | Solution |
|---------|----------|
| `AxiosError: Network Error` on Dashboard | Ensure backend is running and `piIpAddress` is correct |
| Map not showing on web | Leaflet CSS may not be loaded; check `LocationMap.web.tsx` |
| Camera feed disconnects | Check WebSocket port 8080 is open; verify same network |

### Hardware Issues

| Problem | Solution |
|---------|----------|
| ESP32 not sending data | Check baud rate (115200) and UART wiring |
| MPU6050 not responding | Verify I2C connection on GPIO 21 (SDA) and 22 (SCL) |
| Voice assistant not hearing | Check microphone permissions and `sounddevice` configuration |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. Built for **JSS Ideathon 2025**.

---

## 👥 Team

**Team Lingesans**

| Layer | Technologies |
|-------|-------------|
| **Hardware** | ESP32 + MPU6050 + MQ135 + MQ7 + GPS |
| **Edge Computing** | Raspberry Pi + Camera + Voice Assistant |
| **Backend** | Node.js + Express + YOLOv8 + TensorFlow + OCR |
| **Frontend** | React Native + Expo SDK 54 + NativeWind |

---

<p align="center">
  <strong>Built with ❤️ for safer roads</strong>
</p>
