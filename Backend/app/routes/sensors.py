from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from datetime import datetime

# Define the sensor data model
class SensorData(BaseModel):
    sos: bool
    rfid: str
    accel: List[float] = []
    gyro: List[float] = []
    gps_fix: bool
    gps: str
    mq3_v: float
    turb_raw: int
    ultrasonic_cm: int
    button: bool

class SensorReading(BaseModel):
    timestamp: str
    data: SensorData

router = APIRouter(prefix="/sensors", tags=["Sensors"])

# Path to store sensor data
SENSOR_DATA_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'sensor_data.json')

def ensure_sensor_file_exists():
    """Create sensor_data.json if it doesn't exist"""
    if not os.path.exists(SENSOR_DATA_FILE):
        initial_data = {
            "latest": None,
            "history": []
        }
        with open(SENSOR_DATA_FILE, 'w') as f:
            json.dump(initial_data, f, indent=2)

def load_sensor_data():
    """Load sensor data from JSON file"""
    ensure_sensor_file_exists()
    try:
        with open(SENSOR_DATA_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sensor data: {str(e)}")

def save_sensor_data(data):
    """Save sensor data to JSON file"""
    try:
        with open(SENSOR_DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save sensor data: {str(e)}")

@router.post("/upload")
async def upload_sensor_data(sensor_data: SensorData):
    """
    Receive sensor data from ESP32 and store it.
    Accepts data in this format:
    {
        "sos": false,
        "rfid": "",
        "accel": [],
        "gyro": [],
        "gps_fix": false,
        "gps": "",
        "mq3_v": 0.030,
        "turb_raw": 1535,
        "ultrasonic_cm": -1,
        "button": false
    }
    """
    try:
        # Get current sensor data
        all_data = load_sensor_data()
        
        # Create a reading with timestamp
        reading = {
            "timestamp": datetime.now().isoformat(),
            "data": sensor_data.dict()
        }
        
        # Update latest reading
        all_data["latest"] = reading
        
        # Add to history (keep last 100 readings)
        if "history" not in all_data:
            all_data["history"] = []
        
        all_data["history"].append(reading)
        # Keep only last 100 readings to avoid file bloat
        if len(all_data["history"]) > 100:
            all_data["history"] = all_data["history"][-100:]
        
        # Save updated data
        save_sensor_data(all_data)
        
        return {
            "status": "success",
            "message": "Sensor data received and stored",
            "timestamp": reading["timestamp"],
            "data_received": sensor_data.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing sensor data: {str(e)}")

@router.get("/latest")
async def get_latest_sensor_data():
    """Get the latest sensor reading from ESP32"""
    try:
        all_data = load_sensor_data()
        if all_data["latest"] is None:
            return {"message": "No sensor data available yet"}
        return all_data["latest"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_sensor_history(limit: int = 20):
    """Get sensor data history (default last 20 readings)"""
    try:
        all_data = load_sensor_data()
        history = all_data.get("history", [])
        # Return last 'limit' readings
        return {
            "total": len(history),
            "limit": limit,
            "data": history[-limit:]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all")
async def get_all_sensor_data():
    """Get all sensor data (latest + history)"""
    try:
        return load_sensor_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/history")
async def clear_sensor_history():
    """Clear sensor history (keep only latest)"""
    try:
        all_data = load_sensor_data()
        all_data["history"] = []
        save_sensor_data(all_data)
        return {"message": "Sensor history cleared", "latest": all_data["latest"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
