from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardData(BaseModel):
    speed: int = 0
    wearing: bool = False
    accident: str = "none"
    battery: int = 100
    mediaTrack: str = "No track playing"


class LocationData(BaseModel):
    latitude: float = 12.9716
    longitude: float = 77.5946
    address: str = "Bangalore, India"


class IncidentReport(BaseModel):
    id: str
    timestamp: str
    location: str
    severity: str
    thumbnail: str


class ImpactData(BaseModel):
    forceScore: int = 0
    injuryProb: str = "0%"
    fallDirection: str = "None"
    tiltAngle: int = 0
    history: List[dict] = []


class UserData(BaseModel):
    rfid: str = "RFID001"
    name: str = "User"
    avatarUrl: str = "https://ui-avatars.com/api/?name=User&background=4F46E5&color=fff&size=150"
    dashboard: DashboardData = DashboardData()
    location: LocationData = LocationData()
    impact: ImpactData = ImpactData()
    incidents: List[IncidentReport] = []
    settings: dict = {}
    timestamp: str = ""

    def update_timestamp(self):
        self.timestamp = datetime.utcnow().isoformat()
