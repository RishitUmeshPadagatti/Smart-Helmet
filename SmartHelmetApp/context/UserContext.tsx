import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { currentUser as initialUser, familyMembers as initialFamily } from '../lib/mockData';

// Define types based on mock data
type User = typeof initialUser & { phoneNumber?: string };
type FamilyMember = typeof initialFamily[0] & { speed?: number; rfid?: string; mobileNumber?: string };

interface UserContextType {
    user: User;
    familyMembers: FamilyMember[];
    helmetVolume: number;
    updateUser: (updatedUser: Partial<User>) => void;
    addFamilyMember: (member: Omit<FamilyMember, 'id' | 'speed'>) => void;
    removeFamilyMember: (id: number) => void;
    updateHelmetVolume: (volume: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>(initialUser);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [helmetVolume, setHelmetVolume] = useState(80);

    // Load data from storage on mount
    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [storedFamily, storedVolume] = await Promise.all([
                    AsyncStorage.getItem('familyMembers'),
                    AsyncStorage.getItem('helmetVolume')
                ]);

                if (storedFamily) {
                    setFamilyMembers(JSON.parse(storedFamily));
                } else {
                    // Initialize with mock data if empty
                    const initialData = initialFamily.map(m => ({ ...m, speed: 0, status: 'Not Driving', rfid: '', mobileNumber: '' }));
                    setFamilyMembers(initialData);
                    await AsyncStorage.setItem('familyMembers', JSON.stringify(initialData));
                }

                if (storedVolume) {
                    setHelmetVolume(JSON.parse(storedVolume));
                }
            } catch (e) {
                console.error("Failed to load user context data", e);
            }
        };
        loadData();
    }, []);

    // Simulate real-time updates
    React.useEffect(() => {
        const interval = setInterval(() => {
            setFamilyMembers(prev => {
                const updated = prev.map(member => {
                    // 40% chance of being "Not Driving" (speed 0)
                    const isDriving = Math.random() > 0.4;
                    let newSpeed = 0;
                    let newStatus = 'Not Driving';

                    if (isDriving) {
                        newSpeed = Math.floor(Math.random() * 91) + 10;
                        newStatus = 'Driving';
                    }

                    return { ...member, speed: newSpeed, status: newStatus };
                });
                // Note: We do NOT save to storage here to avoid excessive writes for transient data
                return updated;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const updateUser = (updatedUser: Partial<User>) => {
        setUser((prev) => ({ ...prev, ...updatedUser }));
    };

    const addFamilyMember = async (member: Omit<FamilyMember, 'id' | 'speed'>) => {
        const newMember = { ...member, id: Date.now(), speed: 0 };
        const updatedList = [...familyMembers, newMember];
        setFamilyMembers(updatedList);
        await AsyncStorage.setItem('familyMembers', JSON.stringify(updatedList));
    };

    const removeFamilyMember = async (id: number) => {
        const updatedList = familyMembers.filter((member) => member.id !== id);
        setFamilyMembers(updatedList);
        await AsyncStorage.setItem('familyMembers', JSON.stringify(updatedList));
    };

    const updateHelmetVolume = async (volume: number) => {
        const newVolume = Math.max(0, Math.min(100, volume));
        setHelmetVolume(newVolume);
        await AsyncStorage.setItem('helmetVolume', JSON.stringify(newVolume));
    };

    return (
        <UserContext.Provider value={{ user, familyMembers, helmetVolume, updateUser, addFamilyMember, removeFamilyMember, updateHelmetVolume }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
