# Smart Helmet Backend API

FastAPI-based backend for Smart Helmet with video analysis, sensor data management, and user management.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip package manager

### Installation

1. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   
   # Windows (Git Bash)
   source venv/Scripts/activate
   
   # Windows (CMD)
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server will be available at: `http://localhost:8000`

---

## 🔌 API Endpoints

### Root & Health
```
GET /                    # Root endpoint
GET /health             # Health check with timestamp
```

### Users (`/users`)
```
GET /users              # List all users
GET /users/{user_id}    # Get specific user
POST /users/{user_id}   # Create or update user
PATCH /users/{user_id}  # Partial update user
```

### Sensors (`/sensors`) - ESP32 Data
```
POST /sensors/upload         # Receive ESP32 sensor data
GET /sensors/latest          # Get latest reading
GET /sensors/history         # Get historical data
GET /sensors/all             # Get all sensor data
DELETE /sensors/history      # Clear history
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

### Video Analysis (`/video`) - ML Model
```
POST /video/upload       # Upload MP4 for YOLO analysis
GET /results/{filename}  # Download processed video
```

**Video response:**
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

## 🤖 ML Model (YOLOv8)

- **Model:** YOLOv8 (Small variant - 360MB)
- **Task:** Vehicle detection & threat tracking
- **Device:** Auto-detects (GPU if available, else CPU)
- **Supported formats:** MP4, AVI, MOV, MKV

---

## 📊 Data Files

- **user_data.json** - User profiles
- **sensor_data.json** - Sensor readings (auto-created)
- **uploads/** - Temporary video storage
- **processed/** - Output videos

---

## 🧪 Testing

```bash
# Health check
curl http://localhost:8000/health

# Get latest sensors
curl http://localhost:8000/sensors/latest

# List users
curl http://localhost:8000/users
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| ModuleNotFoundError | Run `pip install -r requirements.txt` |
| Port 8000 in use | Use `--port 8001` instead |
| Video upload fails | Check `uploads/` and `processed/` folders exist |
| YOLO model fails | Run `pip install --upgrade ultralytics` |

---

## 📖 Documentation

**API Docs:** `http://localhost:8000/docs`  
**Alternative UI:** `http://localhost:8000/redoc`

---

**Last Updated:** December 11, 2025
- CORS: the server is configured to allow only origins on port `8081` (e.g. the Expo web preview or Metro dev server). If you need access from a different origin, update `main.py`'s CORS settings.
- Data is currently mock/static; integrate with your ESP32 communication method separately.

initialise
connect through wifi and receive data (will be requested from the react native app)
impact analysis ML model (for short videos)
