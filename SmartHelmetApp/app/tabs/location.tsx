import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MapPin, Navigation, Share2 } from 'lucide-react-native';
import { AddFamilyMemberModal } from '../../components/AddFamilyMemberModal';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { locationData } from '../../lib/mockData';
import { useUser } from '../../context/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { cn } from '../../lib/utils';

export default function Location() {
    const [region, setRegion] = useState({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const { familyMembers, addFamilyMember } = useUser();
    const [isAddFamilyVisible, setIsAddFamilyVisible] = useState(false);

    const focusLocation = (lat: number, lng: number) => {
        setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Header title="Location" />
            <View className="flex-1 relative">
                {/* Map Placeholder */}
                <View className="absolute inset-0 bg-gray-200 items-center justify-center shadow-md shadow-black/10 elevation-3">
                    <Image
                        source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-122.4324,37.78825,12,0/600x600?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xh... ' }} // Dummy map image
                        className="w-full h-full opacity-50"
                    />
                    <View className="absolute items-center">
                        <MapPin size={48} color="#EF4444" fill="#EF4444" />
                        <View className="bg-white px-3 py-1 rounded-full shadow-sm mt-2">
                            <Text className="font-bold text-gray-900">You are here</Text>
                        </View>
                    </View>
                </View>

                {/* Overlay Stats */}
                <View className="absolute top-4 left-4 right-4 flex-row justify-between">
                    <View className="bg-white/90 p-3 rounded-2xl shadow-md shadow-black/10 elevation-3 backdrop-blur-md">
                        <View className="flex-row items-center gap-2">
                            <Navigation size={20} color="#4F46E5" />
                            <View>
                                <Text className="text-xs text-gray-500">Speed</Text>
                                <Text className="text-lg font-bold text-gray-900">{locationData.speed} km/h</Text>
                            </View>
                        </View>
                    </View>
                    <View className="bg-white/90 p-3 rounded-2xl shadow-md shadow-black/10 elevation-3 backdrop-blur-md">
                        <View className="flex-row items-center gap-2">
                            <Share2 size={20} color="#4F46E5" />
                            <View>
                                <Text className="text-xs text-gray-500">Share</Text>
                                <Text className="text-lg font-bold text-gray-900">Live</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Family Members List */}
                <View className="absolute bottom-8 left-0 right-0">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                    >
                        {/* Add Member Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsAddFamilyVisible(true)}
                        >
                            <Card className="w-36 p-3 items-center justify-center h-full border-2 border-dashed border-gray-300 bg-gray-50/80">
                                <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mb-2">
                                    <Text className="text-2xl font-light text-gray-500">+</Text>
                                </View>
                                <Text className="font-medium text-gray-500">Add Member</Text>
                            </Card>
                        </TouchableOpacity>

                        {familyMembers.map((member) => (
                            <TouchableOpacity
                                key={member.id}
                                onPress={() => focusLocation(member.location.lat, member.location.lng)}
                                activeOpacity={0.8}
                            >
                                <Card className="w-36 p-3 items-center">
                                    <View className="relative">
                                        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                            <Text className="text-xl font-bold text-gray-600">{member.name[0]}</Text>
                                        </View>
                                        <View className={cn(
                                            "absolute bottom-2 right-0 w-3.5 h-3.5 rounded-full border-2 border-white",
                                            member.status === 'Driving' ? "bg-green-500" :
                                                member.status === 'Not Driving' ? "bg-blue-500" : "bg-gray-400"
                                        )} />
                                    </View>
                                    <Text className="font-semibold text-gray-900">{member.name}</Text>
                                    <Text className="text-xs text-gray-500 mb-1">{member.status}</Text>
                                    {member.speed !== undefined && (
                                        <View className="bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                                            <Text className="text-[10px] font-bold text-gray-600">
                                                {member.speed} km/h
                                            </Text>
                                        </View>
                                    )}
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            <AddFamilyMemberModal
                visible={isAddFamilyVisible}
                onClose={() => setIsAddFamilyVisible(false)}
                onAdd={(member) => {
                    addFamilyMember({
                        ...member,
                        location: { lat: 0, lng: 0 } // Default location
                    });
                }}
            />
        </SafeAreaView>
    );
}
