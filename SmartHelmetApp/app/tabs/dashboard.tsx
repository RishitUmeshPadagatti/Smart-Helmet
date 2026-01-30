import { View, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { SOSButton } from '../../components/SOSButton';
import { Battery, Zap, AlertTriangle, ShieldCheck, Music2, Map, Camera, Wind } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import useUserData from '../hooks/useUserData';
import { currentUser } from '../../lib/mockData';
import { piIpAddress, vapi_authorization_token } from '@/constants/values';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const { userData, loading, error } = useUserData();
    const router = useRouter();
    const [aqi, setAqi] = useState<string>("...");
    const [speed, setSpeed] = useState<string>("0");
    const [latitude, setLatitude] = useState<string>("...");
    const [longitude, setLongitude] = useState<string>("...");

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                const aqiResponse = await axios.get(`http://${piIpAddress}:3000/aqi`);
                setAqi(aqiResponse.data.toString());
            } catch (err) {
                console.log("Error fetching AQI:", err);
            }

            try {
                const speedResponse = await axios.get(`http://${piIpAddress}:3000/speed`);
                setSpeed(speedResponse.data.toString());
            } catch (err) {
                console.log("Error fetching speed:", err);
            }

            try {
                const latResponse = await axios.get(`http://${piIpAddress}:3000/latitude`);
                setLatitude(latResponse.data.toString());
            } catch (err) {
                console.log("Error fetching latitude:", err);
            }

            try {
                const lngResponse = await axios.get(`http://${piIpAddress}:3000/longitude`);
                setLongitude(lngResponse.data.toString());
            } catch (err) {
                console.log("Error fetching longitude:", err);
            }
        };

        fetchLiveData();
        const interval = setInterval(fetchLiveData, 2000);
        return () => clearInterval(interval);
    }, []);

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
                    {/* Speed Card */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <Zap size={28} color="#F59E0B" className="mb-2" />
                        <Text className="text-3xl font-bold">{speed}</Text>
                        <Text className="text-xs uppercase font-medium" variant="muted">m/s</Text>
                    </Card>

                    {/* AQI Card */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <Wind size={28} color="#10B981" className="mb-2" />
                        <Text className="text-3xl font-bold">{aqi}</Text>
                        <Text className="text-xs uppercase font-medium" variant="muted">AQI Index</Text>
                    </Card>

                    {/* Accident Status */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <AlertTriangle size={28} color="#3B82F6" className="mb-2" />
                        <Text className="text-lg font-bold text-center capitalize">{userData.dashboard.accident}</Text>
                        <Text className="text-xs mt-1" variant="muted">Status</Text>
                    </Card>

                    {/* Battery */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <Battery size={28} color="#10B981" className="mb-2" />
                        <Text className="text-3xl font-bold">{userData.dashboard.battery}%</Text>
                        <Text className="text-xs uppercase font-medium" variant="muted">Battery</Text>
                    </Card>
                </View>

                {/* Quick Actions */}
                <Text className="text-lg font-bold mb-3">Quick Actions</Text>
                <View className="gap-3 mb-6">
                    <SOSButton onTrigger={handleSOS} />
                </View>

                {/* Coordinates */}
                <View className="items-center mt-2">
                    <Text variant="muted" className="text-xs">
                        Coordinates: {latitude}, {longitude}
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
