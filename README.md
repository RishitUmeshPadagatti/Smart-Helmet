# Smart Helmet - Intelligent Safety System

A comprehensive smart helmet system with IoT sensors (ESP32), real-time video analysis using YOLOv8, and a React Native mobile app for impact detection and monitoring.

---

## 📋 Project Structure

```
Smart-Helmet/
├── Backend/                 # FastAPI server for video processing & sensor data
│   ├── app/
│   │   ├── routes/
│   │   │   ├── users.py    # User management endpoints
│   │   │   ├── sensors.py  # ESP32 sensor data endpoints
│   │   └── models/
│   │   └── utils/
│   ├── ML_model/
│   │   ├── fault_detection.py     # YOLO video processing
│   │   ├── yolov8s.pt             # Pre-trained model
│   │   └── requirements.txt
│   ├── video.py             # Video upload router
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt      # Python dependencies
│   └── venv/                # Virtual environment
│
├── SmartHelmetApp/          # React Native mobile app
│   ├── app/                 # Navigation & screens
│   ├── components/          # UI components
│   ├── context/             # User context
│   └── package.json
│
├── Contribution.md          # Contribution guidelines
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git
- Windows/Mac/Linux

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Smart-Helmet.git
   cd Smart-Helmet/Backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Activate venv
   # Windows (Git Bash)
   source venv/Scripts/activate
   
   # Or Windows (CMD)
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server will start at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to app folder**
   ```bash
   cd ../SmartHelmetApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the app**
   ```bash
   npm start
   ```

---

## 📡 API Endpoints

### Health Check
```
GET http://localhost:8000/health
```
Returns server status and timestamp.

### User Management
```
GET /users                    # List all users
GET /users/{user_id}          # Get user by ID
POST /users/{user_id}         # Create/update user
PATCH /users/{user_id}        # Partially update user
```

### Sensor Data (ESP32)
```
POST /sensors/upload          # Receive sensor data from ESP32
GET /sensors/latest           # Get latest sensor reading
GET /sensors/history?limit=20 # Get sensor history
GET /sensors/all              # Get all sensor data
DELETE /sensors/history       # Clear history
```

**Sensor data format:**
```json
{
  "sos": false,
  "rfid": "",
  "accel": [0, 0, 0],
  "gyro": [0, 0, 0],
  "gps_fix": false,
  "gps": "",
  "mq3_v": 0.030,
  "turb_raw": 1535,
  "ultrasonic_cm": -1,
  "button": false
}
```

### Video Analysis (ML Model)
```
POST /video/upload            # Upload MP4 for YOLO analysis
GET /results/{filename}       # Download processed video
```

**Response from video upload:**
```json
{
  "message": "Processing complete successfully",
  "original_filename": "video.mp4",
  "processed_filename": "processed_video.mp4",
  "download_url": "/results/processed_video.mp4",
  "analytics": {
    "track_id": [
      {"frame": 1, "score": 0},
      {"frame": 2, "score": 15}
    ]
  }
}
```

---

## 🔧 Configuration

### Backend Configuration Files

**`requirements.txt`** - Python dependencies:
- FastAPI 0.115.6
- Uvicorn 0.32.1
- Pydantic 2.10.3
- Torch (PyTorch)
- Ultralytics (YOLO)
- OpenCV-Python
- NumPy

### Data Storage

- **User data:** `Backend/user_data.json`
- **Sensor data:** `Backend/sensor_data.json` (auto-created)
- **Processed videos:** `Backend/processed/`
- **Uploaded videos:** `Backend/uploads/` (temp, auto-deleted)

---

## 📱 ESP32 Integration

### Arduino Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.100:8000/sensors/upload";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    StaticJsonDocument<512> doc;
    doc["sos"] = false;
    doc["rfid"] = "";
    doc["gps_fix"] = false;
    doc["gps"] = "";
    doc["mq3_v"] = 0.030;
    doc["turb_raw"] = 1535;
    doc["ultrasonic_cm"] = -1;
    doc["button"] = false;
    
    JsonArray accel = doc.createNestedArray("accel");
    accel.add(0.0); accel.add(0.0); accel.add(0.0);
    
    JsonArray gyro = doc.createNestedArray("gyro");
    gyro.add(0.0); gyro.add(0.0); gyro.add(0.0);
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonString);
    
    Serial.print("Response: ");
    Serial.println(httpResponseCode);
    http.end();
  }
  
  delay(5000); // Send every 5 seconds
}
```

**Libraries needed in Arduino IDE:**
- WiFi (built-in)
- HTTPClient (built-in)
- ArduinoJson (install via Library Manager)

---

## 🎥 Video Analysis Features

### ML Model: YOLOv8
- **Model:** YOLOv8 (Small variant)
- **Task:** Object detection & tracking for vehicles
- **Target Classes:** Cars, Bikes, Trucks, Motorcycles
- **Confidence Threshold:** 0.4
- **Processing Device:** CPU (auto-detects GPU if available)

### Output Analytics
- **Track IDs:** Unique identifier for each detected object
- **Threat Scores:** 0-100 score based on:
  - Proximity to center (danger zone)
  - Object area change (approaching/leaving)
  - Movement direction
  - Historical tracking data

### Supported Video Formats
- MP4
- AVI
- MOV
- MKV

---

## 🧪 Testing

### Test Sensor Endpoint (Postman)
```bash
curl -X POST http://localhost:8000/sensors/upload \
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

### Fetch Sensor Data
```bash
curl http://localhost:8000/sensors/latest
```

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

---

## 🐛 Troubleshooting

### Server won't start
```
Error: ModuleNotFoundError: No module named 'torch'
→ Run: pip install -r requirements.txt
```

### 500 Error on video upload
- Check if `Backend/uploads/` and `Backend/processed/` folders exist
- Ensure `yolov8s.pt` is present in `Backend/ML_model/`
- Check if video file is valid MP4 format
- Review server console for detailed error

### ESP32 can't reach backend
- Ensure ESP32 and backend are on same network
- Replace `192.168.1.100` with your actual backend IP
- Check firewall settings allow port 8000

### CORS errors in frontend
- Backend allows origin regex: `https?://.*:8081`
- Ensure frontend runs on port 8081

---

## 📦 GitHub Setup & Pushing

### 1. Initialize Git Repository
```bash
cd Smart-Helmet
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. Create `.gitignore`
```
# Python
venv/
__pycache__/
*.pyc
*.pyo
*.egg-info/
.env

# Node
node_modules/
npm-debug.log
.DS_Store

# Editor
.vscode/
.idea/
*.swp

# ML Model (optional - if file is large)
# Backend/ML_model/yolov8s.pt

# Data
Backend/uploads/
Backend/processed/
sensor_data.json
.env.local
```

### 3. Stage and Commit
```bash
git add .
git commit -m "Initial commit: Smart Helmet system with ESP32, ML analysis, and mobile app"
```

### 4. Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Name: `Smart-Helmet`
3. Description: "Intelligent Smart Helmet with IoT sensors, YOLO video analysis, and impact detection"
4. Click **Create repository**

### 5. Add Remote and Push
```bash
git remote add origin https://github.com/yourusername/Smart-Helmet.git
git branch -M main
git push -u origin main
```

### 6. Future Commits
```bash
# Make changes
git add .
git commit -m "Feature: Add sensor data endpoint"
git push
```

---

## 🔐 Environment Variables

Create `.env` file in Backend folder:
```
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:8081
LOG_LEVEL=INFO
```

---

## 📚 Documentation

- [Contribution Guidelines](./Contribution.md)
- [Backend Setup](./Backend/README.md)
- [ML Model Documentation](./Backend/ML_model/README.md)

---

## 🤝 Contributing

See [Contribution.md](./Contribution.md) for guidelines.

---

## 📄 License

This project is part of JSS Ideathon 2025.

---

## 👥 Team

- **Backend:** FastAPI + YOLOv8 ML Model
- **Frontend:** React Native with Expo
- **Hardware:** ESP32 with IoT Sensors

---

## 🎯 Features

✅ Real-time sensor data collection from ESP32  
✅ AI-powered video analysis with YOLOv8  
✅ Impact threat detection and scoring  
✅ RESTful API for all operations  
✅ React Native mobile app for monitoring  
✅ User management system  
✅ Historical data tracking  
✅ Processed video download  

---

## 📞 Support

For issues, create an issue on GitHub or contact the development team.

---

**Last Updated:** December 11, 2025
