import { useState, useEffect } from 'react';
import { currentUser, helmetData, locationData, impactData, incidents } from '../../lib/mockData';

// Replace with your backend server IP
const API_BASE = 'http://localhost:8000';

export interface UserData {
  rfid: string;
  name: string;
  avatarUrl: string;
  phoneNumber?: string;
  dashboard: {
    speed: number;
    wearing: boolean;
    accident: string;
    battery: number;
    mediaTrack: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  impact: {
    forceScore: number;
    injuryProb: string;
    fallDirection: string;
    tiltAngle: number;
    history: Array<{ timestamp: string; force: number; time: string }>;
  };
  incidents: Array<{
    id: string;
    timestamp: string;
    location: string;
    severity: string;
    thumbnail: string;
  }>;
  settings: Record<string, any>;
  timestamp: string;
}

// Fallback mock data when backend is unavailable
const getMockUserData = (): UserData => ({
  rfid: currentUser.rfid,
  name: currentUser.name,
  avatarUrl: currentUser.avatarUrl,
  phoneNumber: currentUser.phoneNumber || '',
  dashboard: {
    speed: helmetData.speed,
    wearing: helmetData.wearing,
    accident: helmetData.accident,
    battery: helmetData.battery,
    mediaTrack: helmetData.mediaTrack,
  },
  location: {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    address: "Current Location",
  },
  impact: {
    forceScore: impactData.forceScore,
    injuryProb: impactData.injuryProb,
    fallDirection: "None",
    tiltAngle: 0,
    history: [],
  },
  incidents: incidents.map(inc => ({
    id: inc.id.toString(),
    timestamp: inc.timestamp,
    location: inc.location,
    severity: inc.severity,
    thumbnail: inc.thumbnail,
  })),
  settings: {},
  timestamp: new Date().toISOString(),
});

export default function useUserData(userId: string = 'test_user') {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
    // Optionally refresh every 10 seconds
    const interval = setInterval(fetchUserData, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const res = await fetch(`${API_BASE}/users/${userId}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserData(data);
      setError(null);
      setLoading(false);
    } catch (err) {
      // Backend unavailable or timeout - use mock data immediately without loading state
      console.log('Backend unavailable, using mock data immediately');
      setUserData(getMockUserData());
      setError(null);
      setLoading(false);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      setUserData(result.user);
      return result.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data');
      console.error('Update error:', err);
    }
  };

  return { userData, loading, error, fetchUserData, updateUserData };
}
