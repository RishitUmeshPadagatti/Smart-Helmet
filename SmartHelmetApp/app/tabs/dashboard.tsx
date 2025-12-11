import { View, Text, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Battery, Zap, AlertTriangle, ShieldCheck, Music2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserData } from '../hooks/useUserData';
import { currentUser } from '../../lib/mockData';

export default function Dashboard() {
    const { userData, loading, error } = useUserData();

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header title="Dashboard" />
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-500">Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !userData) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header title="Dashboard" />
                <View className="flex-1 items-center justify-center px-4">
                    <Text className="text-red-500 text-center">
                        {error || 'Failed to load user data'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Header title="Dashboard" />
            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Current User Card */}
                <Card className="mb-6 flex-row items-center justify-between">
                    <View>
                        <Text className="text-sm text-gray-500 mb-1">Current User</Text>
                        <Text className="text-xl font-bold text-gray-900">{currentUser.name}</Text>
                        <Text className="text-xs text-gray-400 mt-1">{userData.rfid}</Text>
                    </View>
                    <View className="items-end gap-2">
                        <View className="flex-row items-center gap-1.5">
                            <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            <Text className="text-green-600 font-medium text-sm">Active</Text>
                        </View>
                        <Badge variant="outline">Connected</Badge>
                    </View>
                </Card>

                {/* Live Data Grid */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {/* Speed Card */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <Zap size={28} color="#F59E0B" className="mb-2" />
                        <Text className="text-3xl font-bold text-gray-900">{userData.dashboard.speed}</Text>
                        <Text className="text-xs text-gray-500 uppercase font-medium">km/h</Text>
                    </Card>

                    {/* Wearing Status */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <ShieldCheck size={28} color="#10B981" className="mb-2" />
                        <Text className="text-lg font-bold text-gray-900 text-center">
                            {userData.dashboard.wearing ? "Wearing" : "Not Wearing"}
                        </Text>
                        <Text className="text-xs text-green-600 font-medium mt-1">
                            {userData.dashboard.wearing ? "Safe" : "Warning"}
                        </Text>
                    </Card>

                    {/* Accident Status */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <AlertTriangle size={28} color="#3B82F6" className="mb-2" />
                        <Text className="text-lg font-bold text-gray-900 text-center capitalize">{userData.dashboard.accident}</Text>
                        <Text className="text-xs text-gray-500 mt-1">Status</Text>
                    </Card>

                    {/* Battery */}
                    <Card className="w-[48%] items-center justify-center py-6">
                        <Battery size={28} color="#10B981" className="mb-2" />
                        <Text className="text-3xl font-bold text-gray-900">{userData.dashboard.battery}%</Text>
                        <Text className="text-xs text-gray-500 uppercase font-medium">Battery</Text>
                    </Card>
                </View>

                {/* Quick Actions */}
                <Text className="text-lg font-bold text-gray-900 mb-3">Quick Actions</Text>
                <View className="gap-3 mb-6">
                    <Button variant="destructive" title="SOS Emergency Call" className="w-full" />
                    <Button variant="default" title="Start IIRS Recording" className="w-full bg-blue-600" />
                </View>

                {/* Media */}
                <Card className="flex-row items-center gap-4 bg-gray-900 border-gray-900">
                    <View className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center">
                        <Music2 size={20} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-medium">{userData.dashboard.mediaTrack}</Text>
                        <Text className="text-gray-400 text-xs">Now Playing</Text>
                    </View>
                </Card>

            </ScrollView>
        </SafeAreaView>
    );
}
