# Smart Helmet Backend - Node.js/Express Implementation

A complete Node.js/Express.js backend for the Smart Helmet project, replacing the original Python FastAPI implementation.

## Features

- ✅ User management (CRUD operations)
- ✅ Sensor data collection and storage
- ✅ Video file upload and processing with YOLO ML model
- ✅ Real-time threat detection and analysis
- ✅ CORS configuration for Expo Go integration
- ✅ RESTful API endpoints
- ✅ JSON file-based data storage
- ✅ Error handling and logging
- ✅ GPU acceleration support (CUDA)

## Project Structure

```
Backend-JS/
├── src/
│   ├── routes/           # API route handlers
│   │   ├── users.js      # User endpoints
│   │   ├── sensors.js    # Sensor endpoints
│   │   ├── video.js      # Video processing endpoints
│   │   └── index.js      # Route aggregation
│   ├── models/           # Data models
│   │   ├── User.js       # User data model
│   │   ├── Sensor.js     # Sensor data models
│   │   └── index.js      # Model exports
│   ├── utils/            # Utility functions
│   │   ├── storage.js    # User data persistence
│   │   ├── sensorStorage.js  # Sensor data persistence   │   ├── videoProcessor.js # YOLO ML model integration│   │   └── index.js      # Utility exports
│   ├── middleware/       # Express middleware
│   │   ├── cors.js       # CORS configuration
│   │   └── index.js      # Middleware exports
│   └── server.js         # Main server file
├── data/                 # User data files (JSON)
├── uploads/              # Temporary video uploads
├── processed/            # Processed video outputs
├── package.json          # Dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Installation

1. **Navigate to the Backend-JS directory:**

   ```bash
   cd Backend-JS
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Install Python ML dependencies:**

   ```bash
   pip install -r ML_model/requirements.txt
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if you need to change the PORT or other settings.

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`)

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Users API

- `GET /users` - List all users
- `GET /users/{userId}` - Get user by ID
- `POST /users/{userId}` - Create/update user
- `PATCH /users/{userId}` - Partially update user

### Sensors API

- `POST /sensors/upload` - Upload sensor data from ESP32
- `GET /sensors/latest` - Get latest sensor reading
- `GET /sensors/history?limit=10` - Get sensor history
- `GET /sensors/stats` - Get sensor statistics

### Video Processing API

- `POST /video/upload` - Upload and process video file
- `GET /video/status/{filename}` - Check processing status

## Usage Examples

### Get User Data

```bash
curl http://localhost:3000/users/user001
```

### Upload Sensor Data

```bash
curl -X POST http://localhost:3000/sensors/upload \
  -H "Content-Type: application/json" \
  -d '{
    "sos": false,
    "rfid": "RFID001",
    "accel": [0.1, 0.2, 0.3],
    "gyro": [0.05, 0.1, 0.15],
    "gps_fix": true,
    "gps": "12.9716,77.5946",
    "mq3_v": 0.035,
    "turb_raw": 1520,
    "ultrasonic_cm": 25,
    "button": false
  }'
```

### Upload Video File

```bash
curl -X POST http://localhost:3000/video/upload \
  -F "file=@video.mp4"
```

## Configuration

### CORS Settings

The backend is configured to accept requests from:

- Port 8081 (default Expo Go port)
- No origin (mobile apps, Postman, etc.)

To configure for different origins, edit [src/middleware/cors.js](src/middleware/cors.js)

### Data Storage

User data is stored as JSON files in the `data/` directory.
Sensor data is stored in `sensor_data.json` in the root directory.

## Differences from Python Version

| Feature          | Python (FastAPI)   | Node.js (Express)                       |
| ---------------- | ------------------ | --------------------------------------- |
| Framework        | FastAPI            | Express.js                              |
| Async            | Native async/await | Node.js async/await                     |
| Data Storage     | JSON files         | JSON files                              |
| File Upload      | Python multipart   | multer                                  |
| CORS             | FastAPI middleware | cors package                            |
| Video Processing | Python + YOLO      | Placeholder (integrate with ML service) |

## Video Processing Integration

## Video Processing with YOLO ML Model

The backend includes integrated YOLO v8 object detection for threat analysis in video streams.

### How It Works

1. **Video Upload**: User uploads video file via `/video/upload` endpoint
2. **Python Service**: Node.js spawns a Python process that:
   - Loads the YOLO v8s model (GPU-accelerated if available)
   - Performs object detection and tracking on each frame
   - Calculates threat scores based on:
     - **Looming Factor**: How quickly objects approach the camera
     - **Centering Factor**: Whether objects move toward the center of the frame
   - Annotates video with bounding boxes and threat levels
3. **Analytics Return**: Comprehensive threat analysis is returned to the client

### Threat Scoring

- **Green (Score 0-29)**: Low threat - object far from camera or stable
- **Yellow (Score 30-69)**: Medium threat - object approaching or moving toward center
- **Red (Score 70-100)**: High threat - object rapidly approaching or centered

### YOLO Integration Requirements

The ML model integration requires:

```bash
# Python dependencies (install in Backend directory)
pip install -r Backend/ML_model/requirements.txt
```

These include:

- `ultralytics` - YOLO framework
- `torch` - Deep learning (with CUDA for GPU support)
- `opencv-python` - Video processing
- `numpy` - Numerical computing

### GPU Support

The system automatically detects and uses NVIDIA CUDA GPUs if available. Processing on GPU is significantly faster (10-100x) than CPU.

### Analytics Output

The `/video/upload` endpoint returns detailed analytics:

```json
{
  "message": "Processing complete",
  "original_filename": "video.mp4",
  "processed_filename": "processed_1234567890_video.mp4",
  "download_url": "/results/processed_1234567890_video.mp4",
  "analytics": {
    "totalFrames": 1500,
    "detectedObjects": 42,
    "incidentFrames": 3,
    "riskScore": 0.87,
    "processingTime": 45.23,
    "device": "CUDA",
    "trackingSummary": {
      "totalTracks": 5,
      "averageThreatScore": 28,
      "maxThreatScore": 95
    },
    "trackDetails": {
      "1": {
        "frames": [
          { "frame": 100, "score": 25, "confidence": 0.92 },
          { "frame": 130, "score": 55, "confidence": 0.95 },
          { "frame": 160, "score": 85, "confidence": 0.93 }
        ],
        "max_score": 85,
        "object_class": "car"
      }
    }
  }
}
```

### Video Processing Service

A dedicated Python service (`Backend/ML_model/fault_detection_service.py`) handles all ML operations:

- Loads YOLO model once for efficiency
- Streams frames through GPU
- Calculates threat scores
- Generates annotated output video
- Returns structured analytics

## Dependencies

- **express** - Web framework
- **cors** - CORS middleware
- **multer** - File upload handling
- **dotenv** - Environment variables
- **uuid** - Unique ID generation
- **express-async-errors** - Async error handling
- **nodemon** - Development auto-reload

## Environment Variables

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
MAX_FILE_SIZE=500000000
API_VERSION=1.0.0
API_TITLE=Smart Helmet Backend
```

## Development

### Running Tests

```bash
npm test
```

### Code Structure

- Routes handle HTTP requests/responses
- Models define data structures
- Utils handle file I/O and persistence
- Middleware handles cross-cutting concerns

## Troubleshooting

### Python Dependencies Missing

If you see "module not found" errors, install Python dependencies:

```bash
cd Backend/ML_model
pip install -r requirements.txt
```

### CUDA/GPU Not Detected

The system will automatically fall back to CPU if CUDA is not available. To enable GPU:

1. Install NVIDIA drivers for your GPU
2. Install PyTorch with CUDA support: `pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118`

### Port Already in Use

```bash
# Windows: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### CORS Errors

Check that your frontend is making requests to the correct origin and port.

### File Upload Issues

- Check that `uploads/` and `processed/` directories exist
- Verify file permissions
- Check `MAX_FILE_SIZE` in `.env`
- Ensure video file is not corrupted

## Next Steps

1. ✅ **ML Model Integration**: YOLO v8 detection integrated
2. **Advanced Analytics**: Add more threat metrics and scene understanding
3. **Database**: Consider migrating from JSON files to MongoDB/PostgreSQL
4. **Authentication**: Add JWT or OAuth for user authentication
5. **Real-time Processing**: WebSocket support for live video streams
6. **Testing**: Write unit and integration tests
7. **Documentation**: Generate API documentation with Swagger/OpenAPI

## License

MIT

## Support

For issues or questions, contact the Smart Helmet team.
