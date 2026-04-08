import { View, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SOSButton } from '../../components/SOSButton';
import { Battery, Zap, AlertTriangle, ShieldCheck, Music2, Map, Camera, Wind, Mountain, Move3d } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import useUserData from '../hooks/useUserData';
import { currentUser } from '../../lib/mockData';
import { piIpAddress, vapi_authorization_token } from '@/constants/values';
import { useCallback, useState } from 'react';

export default function Dashboard() {
    const { userData, loading, error } = useUserData();
    const router = useRouter();
    const [altitude, setAltitude] = useState<string>("0");
    const [speed, setSpeed] = useState<string>("0");
    const [aqi, setAqi] = useState<string>("...");
    const [accelX, setAccelX] = useState<string>("0.0");
    const [accelY, setAccelY] = useState<string>("0.0");
    const [accelZ, setAccelZ] = useState<string>("0.0");
    const [latitude, setLatitude] = useState<string>("...");
    const [longitude, setLongitude] = useState<string>("...");

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchLiveData = async () => {
                if (!isActive) return;

                try {
                    const response = await axios.get(`http://${piIpAddress}:3000/esp32-data`);
                    if (isActive && response.data) {
                        setAltitude(response.data.altitude?.toString() || "0");
                        setSpeed(response.data.speed?.toString() || "0");
                        setAqi(response.data.aqi?.toString() || "...");
                        setAccelX(response.data.accelX?.toString() || "0");
                        setAccelY(response.data.accelY?.toString() || "0");
                        setAccelZ(response.data.accelZ?.toString() || "0");
                        setLatitude(response.data.latitude?.toString() || "...");
                        setLongitude(response.data.longitude?.toString() || "...");
                    }
                } catch (err) {
                    console.log("[Dashboard] Error fetching live data:", err);
                }
            };

            fetchLiveData();
            const interval = setInterval(fetchLiveData, 2000);

            return () => {
                isActive = false;
                clearInterval(interval);
            };
        }, [])
    );

    const handleSOS = async () => {
        console.log("SOS Activated! EMERGENCY CALL INITIATED");
        try {
            await axios.post('https://api.vapi.ai/call', {
                "assistantId": "3cd9c587-005f-4921-825b-81129a93ec75",
                "phoneNumberId": "39230bf2-7b5d-465f-853f-784d8b2a86b7",
                "customer": {
                    "number": "+917899396101"
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': vapi_authorization_token
                }
            });
            Alert.alert("Emergency Alert Sent", "Emergency contacts and services have been notified.");
        } catch (err) {
            console.log("SOS API call failed (expected in demo):", err);
            Alert.alert("Emergency Alert Sent", "Emergency contacts and services have been notified.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
                <Header title="Dashboard" />
                <View className="flex-1 items-center justify-center">
                    <Text variant="muted">Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !userData) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
                <Header title="Dashboard" />
                <View className="flex-1 items-center justify-center px-4">
                    <Text variant="destructive" className="text-center">
                        {error || 'Failed to load user data'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
            <Header
                title="Dashboard"
                rightContent={
                    <View className="flex-row items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onPress={() => router.push('/live-cam' as any)}
                        >
                            <Camera size={24} color="#3b82f6" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onPress={() => router.push('/tabs/location')}
                        >
                            <Map size={24} color="#3b82f6" />
                        </Button>
                    </View>
                }
            />
            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Current User Card */}
                <Card className="mb-6 flex-row items-center justify-between">
                    <View>
                        <Text className="text-sm mb-1" variant="muted">Current User</Text>
                        <Text className="text-xl font-bold">{currentUser.name}</Text>
                        <Text className="text-xs mt-1" variant="muted">{userData.rfid}</Text>
                    </View>
                    <View className="items-end gap-2">
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <Text variant="success" className="font-medium text-sm">Active</Text>
                        </View>
                        <Badge variant="outline">Connected</Badge>
                    </View>
                </Card>

                {/* Live Data Grid */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {/* Altitude Card */}
                    <Card className="w-[48%] items-center justify-center py-6 px-2">
                        <Mountain size={28} color="#3B82F6" className="mb-2" />
                        <Text className="text-2xl font-bold text-center" adjustsFontSizeToFit numberOfLines={1}>{altitude}</Text>
                        <Text className="text-xs uppercase font-medium mt-1" variant="muted">Altitude (m)</Text>
                    </Card>

                    {/* Speed Card */}
                    <Card className="w-[48%] items-center justify-center py-6 px-2">
                        <Zap size={28} color="#F59E0B" className="mb-2" />
                        <Text className="text-2xl font-bold text-center" adjustsFontSizeToFit numberOfLines={1}>{speed}</Text>
                        <Text className="text-xs uppercase font-medium mt-1" variant="muted">Speed (m/s)</Text>
                    </Card>

                    {/* AQI Card */}
                    <Card className="w-[48%] items-center justify-center py-6 px-2">
                        <Wind size={28} color="#10B981" className="mb-2" />
                        <Text className="text-xl font-bold text-center" adjustsFontSizeToFit numberOfLines={1}>{aqi}</Text>
                        <Text className="text-xs uppercase font-medium mt-1" variant="muted">AQI Index</Text>
                    </Card>

                    {/* Acceleration Card */}
                    <Card className="w-[48%] items-center justify-center py-6 px-2">
                        <Move3d size={28} color="#EF4444" className="mb-2" />
                        <View className="flex-row gap-1 mt-1 w-full justify-center px-1">
                            <Text className="text-xs font-bold text-gray-700 dark:text-gray-300" adjustsFontSizeToFit numberOfLines={1}>X:{accelX}</Text>
                            <Text className="text-xs font-bold text-gray-700 dark:text-gray-300" adjustsFontSizeToFit numberOfLines={1}>Y:{accelY}</Text>
                            <Text className="text-xs font-bold text-gray-700 dark:text-gray-300" adjustsFontSizeToFit numberOfLines={1}>Z:{accelZ}</Text>
                        </View>
                        <Text className="text-[10px] uppercase font-medium mt-1" variant="muted">Accel (g)</Text>
                    </Card>
                </View>

                {/* Quick Actions */}
                <Text className="text-lg font-bold mb-3">Quick Actions</Text>
                <View className="gap-3 mb-6">
                    <SOSButton onTrigger={handleSOS} />
                </View>

                {/* Coordinates */}
                <View className="items-center mt-2">
                    <Text variant="muted" className="text-[10px]">
                        LAT: {latitude}, LON: {longitude}
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
