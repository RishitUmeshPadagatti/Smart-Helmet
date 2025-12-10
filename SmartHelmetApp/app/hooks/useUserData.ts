import { useState, useEffect } from 'react';

// Replace with your backend server IP
const API_BASE = 'http://192.168.1.4:8000';
const USER_ID = 'test_user';

export interface UserData {
  rfid: string;
  name: string;
  avatarUrl: string;
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

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
    // Optionally refresh every 10 seconds
    const interval = setInterval(fetchUserData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/${USER_ID}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (updates: Partial<UserData>) => {
    try {
      const res = await fetch(`${API_BASE}/users/${USER_ID}`, {
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
