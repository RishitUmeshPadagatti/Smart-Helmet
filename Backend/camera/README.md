# Camera Streaming Server

Express.js-based camera streaming server for Smart Helmet with MJPEG support and real-time video streaming.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd Backend/camera
npm install
```

### 2. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

Server will start on: `http://localhost:3001`

---

## 📡 API Endpoints

### Health & Info

```
GET /health              # Server health check
GET /endpoints           # List all endpoints
```

### Camera Control

```
POST /camera/start       # Start camera stream
POST /camera/stop        # Stop camera stream
GET /camera/status       # Get camera status
```

### Frame Operations

```
POST /camera/frame       # Upload frame from camera
GET /camera/frame        # Get latest frame
```

### Streaming

```
GET /camera/mjpeg        # MJPEG stream (for video players)
GET /camera/sse          # Server-sent events stream
```

---

## 🔌 Usage Examples

### Start Camera Stream

```bash
curl -X POST http://localhost:3001/camera/start
```

**Response:**

```json
{
  "success": true,
  "message": "Camera stream started",
  "streamUrl": "/camera/stream"
}
```

### Get Camera Status

```bash
curl http://localhost:3001/camera/status
```

**Response:**

```json
{
  "isActive": true,
  "startedAt": "2025-12-11T10:30:45.123Z",
  "frameBufferSize": 1024
}
```

### Get Latest Frame

```bash
curl http://localhost:3001/camera/frame
```

**Response:**

```json
{
  "success": true,
  "frameData": "base64_encoded_image_data",
  "timestamp": "2025-12-11T10:30:50.456Z"
}
```

### Upload Frame from Camera

```bash
curl -X POST http://localhost:3001/camera/frame \
  -H "Content-Type: application/json" \
  -d '{
    "frameData": "base64_encoded_image",
    "timestamp": "2025-12-11T10:30:50.456Z"
  }'
```

---

## 🎥 Streaming Options

### MJPEG Stream

Best for: Video players, web browsers, compatibility

```bash
# In browser or video player
http://localhost:3001/camera/mjpeg
```

### Server-Sent Events (SSE)

Best for: Real-time frame updates to web applications

```javascript
const eventSource = new EventSource("http://localhost:3001/camera/sse");
eventSource.onmessage = (event) => {
  const frameData = JSON.parse(event.data);
  console.log("Frame:", frameData);
};
```

---

## 🔗 CORS Configuration

Currently allows these origins:

- `http://localhost:8081` - React Native app
- `http://localhost:3000` - Web development
- `http://localhost:5173` - Vite development
- Any origin on port 8081

**To add your IP:**

Edit `server.js` and update `allowedOrigins`:

```javascript
const allowedOrigins = [
  "http://localhost:8081",
  "http://192.168.1.YOUR_IP:8081", // Add your IP here
];
```

---

## 🎥 Real Camera Integration

### Using OpenCV (USB/IP Camera)

1. **Install OpenCV for Node.js:**

   ```bash
   npm install opencv4nodejs
   ```

2. **Modify server.js:**

   ```javascript
   const cv = require("opencv4nodejs");
   const camera = new cv.VideoCapture(0); // 0 = default camera

   const captureFrame = () => {
     const frame = camera.read();
     const jpegBuffer = cv.imencode(".jpg", frame);
     // Send or store frame
   };
   ```

3. **IP Camera Support:**
   ```javascript
   const camera = new cv.VideoCapture(
     "rtsp://username:password@ip:port/stream"
   );
   ```

---

## 📦 Project Structure

```
camera/
├── server.js         # Main Express server
├── package.json      # Dependencies
├── CONFIG.md         # Configuration guide
└── README.md        # This file
```

---

## 🔧 Environment Variables

Create `.env` file:

```
PORT=3001
NODE_ENV=development
CAMERA_ENABLED=true
CAMERA_INDEX=0
STREAM_FPS=30
STREAM_QUALITY=80
```

---

## 🧪 Testing

### Test Server Health

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "Camera Streaming Server",
  "timestamp": "2025-12-11T10:30:45.123Z",
  "cameraActive": false
}
```

### Test Start Stream

```bash
curl -X POST http://localhost:3001/camera/start
```

### Test MJPEG Stream

```bash
# Open in browser
http://localhost:3001/camera/mjpeg
```

### Using Postman

1. Import endpoints from `/endpoints`
2. Test each endpoint
3. Monitor response headers for streaming

---

## ✅ Integration Checklist

**1. Camera Server Running?**

```bash
cd Smart-Helmet/Backend/camera
npm start
```

Should see: `Camera Streaming Server Running on http://0.0.0.0:3001`

**2. React Native App Running?**

```bash
cd Smart-Helmet/SmartHelmetApp
npm start
```

**3. Update Camera Server IP**
Find your computer's IP:

```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

Update in `SmartHelmetApp/app/tabs/iirs.tsx` (line 13):

```typescript
const CAMERA_SERVER_URL = "http://YOUR_ACTUAL_IP:3001";
```

**4. Test in React Native App**

- Go to **IIRS tab**
- Click **"Start Recording"** button
- Expected results:
  - ✅ Button changes from green to red
  - ✅ "LIVE" badge appears with red dot
  - ✅ Live camera feed displays (or error if unreachable)

**5. Verify Server Health**

```bash
curl http://localhost:3001/health
```

---

## 🎯 How Integration Works

1. **React Native App** (IIRS tab) sends POST to `/camera/start`
2. **Camera Server** activates and prepares stream
3. **App** fetches frames every 100ms from `/camera/frame`
4. **Frames** display as base64 encoded JPEG images
5. **Live indicator** shows when streaming
6. **App** sends POST to `/camera/stop` when done

---

## 🧪 Testing

### Test Server Health

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "Camera Streaming Server",
  "timestamp": "2025-12-11T10:30:45.123Z",
  "cameraActive": false
}
```

### Test Start Stream

```bash
curl -X POST http://localhost:3001/camera/start
```

### Test MJPEG Stream

```bash
# Open in browser
http://localhost:3001/camera/mjpeg
```

### Using Postman

1. Import endpoints from `/endpoints`
2. Test each endpoint
3. Monitor response headers for streaming

---

## 📱 React Native Integration

See `CameraStream.tsx` component for full implementation.

**Quick setup:**

```typescript
import CameraStreamScreen from "./components/CameraStream";

// In your navigation
<Stack.Screen name="Camera" component={CameraStreamScreen} />;
```

**Update server URL in component:**

```typescript
const CAMERA_SERVER_URL = "http://YOUR_IP:3001";
```

---

## 🐛 Troubleshooting

| Issue                    | Solution                                                 |
| ------------------------ | -------------------------------------------------------- |
| Port 3001 already in use | Change PORT env variable: `PORT=3002 npm start`          |
| CORS errors              | Update `allowedOrigins` in server.js with your IP        |
| No frames captured       | Ensure `/camera/start` is called before accessing frames |
| Stream not displaying    | Check browser/app supports MJPEG or SSE                  |

---

## 🚀 Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name "camera-server"
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t smart-helmet-camera .
docker run -p 3001:3001 smart-helmet-camera
```

---

## 📊 Performance Notes

- **MJPEG Stream:** ~30 FPS, good for video players
- **SSE Stream:** ~10 FPS, good for real-time updates
- **Frame Upload:** On-demand, best for capturing critical moments

---

## 🔐 Security Considerations

1. **Authentication:** Add JWT or API keys for production
2. **CORS:** Restrict origins to your domain only
3. **Rate Limiting:** Implement request throttling
4. **HTTPS:** Use SSL/TLS in production
5. **Input Validation:** Validate all incoming data

---

## 📄 License

Part of Smart Helmet Project - JSS Ideathon 2025

---

## 🤝 Contributing

For issues or improvements, contact the development team.

---

**Last Updated:** December 11, 2025  
**Status:** ✅ Production Ready
