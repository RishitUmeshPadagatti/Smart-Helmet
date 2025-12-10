### Mohith and Kumar

#### Backend Server Setup

This backend is built with Python using FastAPI.

##### Installation

1. Ensure Python 3.8+ is installed.
2. Create a virtual environment: `python -m venv venv`
3. Activate: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`

##### Running the Server

Run: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`

The API will be available at http://localhost:8000

##### Endpoints

- `GET /get_data`: Returns the latest sensor data for the React Native app.
- `GET /`: Root endpoint.

##### React Native App Integration

- The app can fetch data by making GET requests to `/get_data`.
- Ensure CORS is configured (currently allows all origins).
- Data is currently mock/static; integrate with your ESP32 communication method separately.
- The app can fetch data by making GET requests to `/get_data`.
- CORS: the server is configured to allow only origins on port `8081` (e.g. the Expo web preview or Metro dev server). If you need access from a different origin, update `main.py`'s CORS settings.
- Data is currently mock/static; integrate with your ESP32 communication method separately.

initialise
connect through wifi and receive data (will be requested from the react native app)
impact analysis ML model (for short videos)
