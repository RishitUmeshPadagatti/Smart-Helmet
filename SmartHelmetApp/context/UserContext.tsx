import React, { createContext, useContext, useState, ReactNode } from 'react';
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
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
        initialFamily.map(m => ({ ...m, speed: 0, status: 'Not Driving', rfid: '', mobileNumber: '' }))
    );
    const [helmetVolume, setHelmetVolume] = useState(80);

    // Simulate real-time updates
    React.useEffect(() => {
        const interval = setInterval(() => {
            setFamilyMembers(prev => prev.map(member => {
                // 40% chance of being "Not Driving" (speed 0)
                const isDriving = Math.random() > 0.4;

                let newSpeed = 0;
                let newStatus = 'Not Driving';

                if (isDriving) {
                    // Speed between 10 and 100
                    newSpeed = Math.floor(Math.random() * 91) + 10;
                    newStatus = 'Driving';
                }

                return {
                    ...member,
                    speed: newSpeed,
                    status: newStatus
                };
            }));
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const updateUser = (updatedUser: Partial<User>) => {
        setUser((prev) => ({ ...prev, ...updatedUser }));
    };

    const addFamilyMember = (member: Omit<FamilyMember, 'id' | 'speed'>) => {
        const newMember = { ...member, id: Date.now(), speed: 0 }; // Simple ID generation
        setFamilyMembers((prev) => [...prev, newMember]);
    };

    const removeFamilyMember = (id: number) => {
        setFamilyMembers((prev) => prev.filter((member) => member.id !== id));
    };

    const updateHelmetVolume = (volume: number) => {
        setHelmetVolume(Math.max(0, Math.min(100, volume)));
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
