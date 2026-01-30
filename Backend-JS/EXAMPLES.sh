#!/bin/bash
# Example usage of Smart Helmet Backend with YOLO processing

echo "=== Smart Helmet Backend - YOLO Processing Examples ==="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3000"

echo -e "${BLUE}1. Health Check${NC}"
echo "Verify server is running:"
echo ""
curl -s "$API_URL/health" | jq '.'
echo ""
echo ""

echo -e "${BLUE}2. Upload Video for YOLO Processing${NC}"
echo "Upload a video file (mp4, avi, mov, mkv):"
echo ""
echo "curl -X POST $API_URL/video/upload \\"
echo "  -F \"file=@your_video.mp4\""
echo ""
echo "Response will include:"
echo "  - processed_filename: Name of output video with annotations"
echo "  - download_url: URL to download processed video"
echo "  - analytics: Threat detection results"
echo ""
echo ""

echo -e "${BLUE}3. Get Sensor Data${NC}"
echo "Upload sensor readings from ESP32:"
echo ""
echo "curl -X POST $API_URL/sensors/upload \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{
    \"sos\": false,
    \"rfid\": \"RFID001\",
    \"accel\": [0.1, 0.2, 0.3],
    \"gyro\": [0.05, 0.1, 0.15],
    \"gps_fix\": true,
    \"gps\": \"12.9716,77.5946\",
    \"mq3_v\": 0.035,
    \"turb_raw\": 1520,
    \"ultrasonic_cm\": 25,
    \"button\": false
  }'"
echo ""
echo ""

echo -e "${BLUE}4. Get Latest Sensor Reading${NC}"
echo "Fetch the most recent sensor data:"
echo ""
echo "curl $API_URL/sensors/latest"
echo ""
echo ""

echo -e "${BLUE}5. Get Sensor History${NC}"
echo "Get last 20 sensor readings:"
echo ""
echo "curl \"$API_URL/sensors/history?limit=20\""
echo ""
echo ""

echo -e "${BLUE}6. Get Sensor Statistics${NC}"
echo "Calculate averages from sensor history:"
echo ""
echo "curl $API_URL/sensors/stats"
echo ""
echo ""

echo -e "${BLUE}7. User Management${NC}"
echo "Create/update user profile:"
echo ""
echo "curl -X POST $API_URL/users/user001 \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{
    \"name\": \"John Doe\",
    \"rfid\": \"RFID001\",
    \"settings\": {\"theme\": \"dark\"}
  }'"
echo ""
echo ""

echo -e "${BLUE}8. Get User Data${NC}"
echo "Retrieve user profile:"
echo ""
echo "curl $API_URL/users/user001"
echo ""
echo ""

echo -e "${YELLOW}=== YOLO Processing Details ===${NC}"
echo ""
echo "The backend automatically:"
echo "  1. Validates video file (type, size)"
echo "  2. Saves to uploads/ directory"
echo "  3. Spawns Python process for YOLO"
echo "  4. Loads YOLO v8s model on GPU/CPU"
echo "  5. Detects vehicles in each frame"
echo "  6. Tracks objects across frames"
echo "  7. Calculates threat scores:"
echo "     - Looming: How fast object approaches"
echo "     - Centering: Movement toward frame center"
echo "  8. Draws colored boxes on video:"
echo "     - GREEN (0-29): Safe"
echo "     - YELLOW (30-69): Warning"
echo "     - RED (70-100): Danger"
echo "  9. Outputs annotated video"
echo "  10. Returns JSON analytics"
echo ""
echo ""

echo -e "${YELLOW}=== Analytics Response Example ===${NC}"
echo ""
echo "After video processing, you'll get:"
echo ""
cat << 'EOF'
{
  "message": "Processing complete",
  "original_filename": "test.mp4",
  "processed_filename": "processed_1701234567890_test.mp4",
  "download_url": "/results/processed_1701234567890_test.mp4",
  "analytics": {
    "totalFrames": 1500,
    "detectedObjects": 8,
    "incidentFrames": 45,
    "riskScore": 0.62,
    "device": "CUDA",
    "processingTime": 23.5,
    "trackingSummary": {
      "totalTracks": 3,
      "averageThreatScore": 42,
      "maxThreatScore": 95
    },
    "trackDetails": {
      "1": {
        "object_class": "car",
        "max_score": 95,
        "frames": [
          {"frame": 100, "score": 20, "confidence": 0.94},
          {"frame": 130, "score": 65, "confidence": 0.96},
          {"frame": 160, "score": 95, "confidence": 0.95}
        ]
      },
      "2": {
        "object_class": "truck",
        "max_score": 72,
        "frames": [
          {"frame": 200, "score": 15, "confidence": 0.91},
          {"frame": 250, "score": 45, "confidence": 0.93},
          {"frame": 300, "score": 72, "confidence": 0.92}
        ]
      }
    }
  }
}
EOF
echo ""
echo ""

echo -e "${YELLOW}=== Performance Tips ===${NC}"
echo ""
echo "GPU Processing (NVIDIA):"
echo "  - RTX 3070: ~3-5 seconds per minute of video"
echo "  - T4 GPU: ~10-15 seconds per minute of video"
echo ""
echo "CPU Processing:"
echo "  - Intel i7: ~5-10 minutes per minute of video"
echo "  - Apple M1: ~1-2 minutes per minute of video"
echo ""
echo "Optimization:"
echo "  - Shorter videos process faster"
echo "  - Lower resolution = faster processing"
echo "  - GPU required for real-time processing"
echo ""
echo ""

echo -e "${YELLOW}=== Troubleshooting ===${NC}"
echo ""
echo "Python not found:"
echo "  export PATH=/path/to/python:\$PATH"
echo ""
echo "YOLO model not found:"
echo "  Check Backend/ML_model/yolov8s.pt exists"
echo ""
echo "GPU not detected:"
echo "  Install: pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118"
echo ""
echo "Port already in use:"
echo "  lsof -i :3000 | grep LISTEN"
echo "  kill -9 <PID>"
echo ""
