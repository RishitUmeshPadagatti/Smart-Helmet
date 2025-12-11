# Camera Streaming Server Configuration

## Environment Variables

Create a `.env` file in this directory:

```
PORT=3001
NODE_ENV=development
CAMERA_ENABLED=true
CAMERA_INDEX=0
STREAM_FPS=30
STREAM_QUALITY=80
```

## Variables Explanation

- **PORT**: Server port (default: 3001)
- **NODE_ENV**: Environment (development/production)
- **CAMERA_ENABLED**: Enable/disable camera access
- **CAMERA_INDEX**: Camera device index (0 = default camera)
- **STREAM_FPS**: Frames per second for streaming
- **STREAM_QUALITY**: JPEG quality (0-100)

## Real Hardware Integration

To connect a real camera (OpenCV):

1. Install OpenCV for Node.js:

   ```bash
   npm install opencv4nodejs
   ```

2. Modify `server.js` to use actual camera:

   ```javascript
   const cv = require("opencv4nodejs");
   const camera = new cv.VideoCapture(0);
   ```

3. Capture frames:
   ```javascript
   const frame = camera.read();
   const jpegBuffer = cv.imencode(".jpg", frame);
   ```

## Testing without Real Camera

The server includes test endpoints that work without hardware:

- `/camera/mjpeg` - MJPEG stream
- `/camera/sse` - Server-sent events
- `/camera/frame` - Manual frame upload

## CORS Configuration

Currently allows these origins:

- `http://localhost:8081` - React Native dev
- `http://localhost:3000` - Web dev
- `http://localhost:5173` - Vite dev
- Update IP addresses as needed
