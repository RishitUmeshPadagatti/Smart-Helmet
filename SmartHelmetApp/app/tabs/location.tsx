import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MapPin, Navigation, Share2 } from 'lucide-react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { locationData, familyMembers } from '../../lib/mockData';
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

    const focusLocation = (lat: number, lng: number) => {
        setRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <Header
                title="Location"
                rightContent={
                    <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
                        <Share2 size={20} color="black" />
                    </TouchableOpacity>
                }
            />

            {/* Map Placeholder Section */}
            <View className="flex-1 rounded-3xl overflow-hidden mx-4 shadow-sm border border-gray-100 bg-gray-100 items-center justify-center relative">
                <View className="items-center">
                    <MapPin size={48} color="#CBD5E1" />
                    <Text className="text-gray-400 font-medium mt-2">Map View Placeholder</Text>
                    <Text className="text-gray-400 text-xs text-center px-8 mt-1">Native Maps disabled for Expo Go stability</Text>
                </View>

                {/* Mock User Location Dot */}
                <View className="absolute top-1/2 left-1/2 -ml-2 -mt-2 bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" />

                {/* Overlay Stats */}
                <View className="absolute top-4 left-4 bg-white/90 p-2 rounded-lg border border-gray-100 shadow-sm backdrop-blur-sm">
                    <Text className="text-xs text-gray-500">Speed</Text>
                    <Text className="text-lg font-bold">{locationData.speed} km/h</Text>
                </View>
            </View>

            {/* Family Members List */}
            <View className="h-1/3 bg-white px-4 pt-6 pb-2">
                <Text className="text-lg font-bold text-gray-900 mb-4">Family Members</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
                    {familyMembers.map((member) => (
                        <TouchableOpacity
                            key={member.id}
                            // onPress={() => focusLocation(member.location.lat, member.location.lng)}
                            activeOpacity={0.8}
                        >
                            <Card className="w-32 p-3 items-center">
                                <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                    <Text className="text-xl font-bold text-gray-600">{member.name[0]}</Text>
                                </View>
                                <Text className="font-semibold text-gray-900">{member.name}</Text>
                                <Text className="text-xs text-gray-500">{member.status}</Text>
                            </Card>
                        </TouchableOpacity>
                    ))}

                    {/* Add Member Dummy */}
                    <TouchableOpacity activeOpacity={0.8} className="justify-center">
                        <View className="w-32 h-28 border-2 border-dashed border-gray-200 rounded-xl items-center justify-center bg-gray-50">
                            <Text className="text-gray-400 font-medium">+ Add</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
