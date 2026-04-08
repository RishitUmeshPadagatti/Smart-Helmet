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
        { latitude: locationData.latitude + 0.002, longitude: locationData.longitude + 0.002, weight: 300 },
        { latitude: locationData.latitude - 0.002, longitude: locationData.longitude - 0.002, weight: 290 },
        { latitude: locationData.latitude + 0.003, longitude: locationData.longitude - 0.001, weight: 310 },
        { latitude: locationData.latitude - 0.001, longitude: locationData.longitude + 0.003, weight: 300 },
        { latitude: locationData.latitude, longitude: locationData.longitude, weight: 330 }
    ];

    return (
        <MapView
            style={{ width: '100%', height: '100%' }}
            region={region}
            onRegionChangeComplete={setRegion}
            provider={PROVIDER_DEFAULT}
        >
            {showHeatmap && aqiPoints.map((point, index) => (
                <Marker
                    key={`aqi-point-${index}-${point.latitude}-${point.longitude}`}
                    coordinate={{ latitude: point.latitude, longitude: point.longitude }}
                >
                    <View className={cn(
                        "px-2 py-1 rounded-full border border-white shadow-sm",
                        point.weight > 80 ? "bg-red-500" :
                            point.weight > 60 ? "bg-orange-500" :
                                point.weight > 40 ? "bg-yellow-500" :
                                    "bg-green-500"
                    )}>
                        <Text className="text-[12px] font-bold text-white">{point.weight}</Text>
                    </View>
                </Marker>
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
