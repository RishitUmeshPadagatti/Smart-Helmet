import { View, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { impactData } from '../../lib/mockData';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, AlertTriangle, ShieldAlert, TrendingUp, PlayCircle, ChevronLeft } from 'lucide-react-native';

export default function ImpactAnalysisDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const chartData = impactData.history.map((item, index) => ({ value: item.force, label: item.time }));

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header
                title={`Impact Analysis #${id}`}
                leftContent={
                    <TouchableOpacity onPress={() => router.back()} className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                        <ChevronLeft size={24} color="#6B7280" />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Video Playback Placeholder */}
                <Card className="mb-6 p-0 overflow-hidden h-56 bg-black justify-center items-center relative">
                    <View className="absolute z-10 items-center">
                        <PlayCircle size={48} color="white" className="opacity-90" />
                        <Text className="text-white font-medium mt-2">Replay Impact Video</Text>
                    </View>
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1595182903337-95192c483c2e?q=80&w=600&auto=format&fit=crop" }}
                        className="w-full h-full opacity-50"
                        resizeMode="cover"
                    />
                </Card>

                {/* Summary Cards */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    <Card className="w-[48%] py-4 items-center border-red-100 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/20">
                        <Activity size={24} color="#EF4444" className="mb-2" />
                        <Text className="text-3xl font-bold">{impactData.forceScore}</Text>
                        <Text className="text-xs font-medium" variant="destructive">Impact Force</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <ShieldAlert size={24} color="#F59E0B" className="mb-2" />
                        <Text className="text-xl font-bold">{impactData.injuryProb}</Text>
                        <Text className="text-xs font-medium" variant="muted">Injury Prob.</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <AlertTriangle size={24} color="#6366F1" className="mb-2" />
                        <Text className="text-lg font-bold">{impactData.fallDirection}</Text>
                        <Text className="text-xs font-medium" variant="muted">Fall Direction</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <TrendingUp size={24} color="#10B981" className="mb-2" />
                        <Text className="text-2xl font-bold">{impactData.tiltAngle}°</Text>
                        <Text className="text-xs font-medium" variant="muted">Tilt Angle</Text>
                    </Card>
                </View>

                {/* Chart Visual */}
                <Card className="mb-6 p-4 pb-8">
                    <SectionTitle title="Impact Force Timeline" className="mb-6" />
                    <View className="h-48 flex-row items-end justify-between px-2">
                        {chartData.map((item, index) => (
                            <View key={index} className="items-center gap-2">
                                <View
                                    className="w-8 rounded-t-sm bg-red-400 opacity-80"
                                    style={{ height: `${Math.min((item.value / 10) * 100, 100)}%` }}
                                />
                                <Text className="text-[10px]" variant="muted">{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}
