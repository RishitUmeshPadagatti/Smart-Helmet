import React from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region, Circle } from 'react-native-maps';
import { Text } from './Text';
import { MapPin } from 'lucide-react-native';
import { cn } from '../lib/utils';
import { FamilyMember } from '../context/UserContext';
import { locationData } from '../lib/mockData';

interface LocationMapProps {
    region: Region;
    setRegion: (region: Region) => void;
    familyMembers: FamilyMember[];
    showHeatmap?: boolean;
}

export function LocationMap({ region, setRegion, familyMembers, showHeatmap }: LocationMapProps) {
    // Mock AQI points around the user's location
    const aqiPoints = [
        { latitude: locationData.latitude + 0.002, longitude: locationData.longitude + 0.002, weight: 80 },
        { latitude: locationData.latitude - 0.002, longitude: locationData.longitude - 0.002, weight: 60 },
        { latitude: locationData.latitude + 0.003, longitude: locationData.longitude - 0.001, weight: 90 },
        { latitude: locationData.latitude - 0.001, longitude: locationData.longitude + 0.003, weight: 40 },
        { latitude: locationData.latitude, longitude: locationData.longitude, weight: 50 },
    ];

    return (
        <MapView
            style={{ width: '100%', height: '100%' }}
            region={region}
            onRegionChangeComplete={setRegion}
            provider={PROVIDER_DEFAULT}
        >
            {showHeatmap && aqiPoints.map((point, index) => (
                <Circle
                    key={`aqi-point-${index}-${point.latitude}-${point.longitude}`}
                    center={{ latitude: point.latitude, longitude: point.longitude }}
                    radius={150}
                    fillColor={
                        point.weight > 80 ? "rgba(255, 0, 0, 0.3)" :    // Red
                            point.weight > 60 ? "rgba(255, 126, 0, 0.3)" :  // Orange
                                point.weight > 40 ? "rgba(255, 255, 0, 0.3)" :  // Yellow
                                    "rgba(0, 228, 0, 0.3)"                     // Green
                    }
                    strokeWidth={0}
                />
            ))}

            {familyMembers.map((member) => (
                <Marker
                    key={`family-member-${member.id}`}
                    coordinate={{
                        latitude: member.location.lat,
                        longitude: member.location.lng,
                    }}
                    title={member.name}
                    description={member.status}
                >
                    <View className="items-center">
                        <View className={cn(
                            "rounded-full p-1 border-2 border-white shadow-sm flex-row items-center justify-center",
                            member.status === 'Driving' ? "bg-green-500" : "bg-blue-500"
                        )}>
                            <MapPin size={18} color="white" fill="white" />
                        </View>
                        <View className="bg-black/80 px-2 py-1 rounded-md shadow-sm mt-1">
                            <Text className="text-[10px] font-bold text-white">{member.name}</Text>
                        </View>
                    </View>
                </Marker>
            ))}

            <Marker
                key="user-location-marker"
                coordinate={{
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                }}
                title="You"
                description="Current Location"
            >
                <View className="items-center">
                    <View className="bg-red-500 rounded-full p-1 border-2 border-white shadow-sm">
                        <MapPin size={24} color="white" fill="white" />
                    </View>
                    <View className="bg-black/80 px-2 py-1 rounded-md shadow-sm mt-1">
                        <Text className="text-[10px] font-bold text-white">You</Text>
                    </View>
                </View>
            </Marker>
        </MapView>
    );
}
