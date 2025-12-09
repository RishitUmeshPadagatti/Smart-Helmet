import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { impactData } from '../../lib/mockData';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function Impact() {
    const chartData = impactData.history.map((item, index) => ({ value: item.force, label: item.time }));

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Header title="Impact Analysis" />
            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Summary Cards */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    <Card className="w-[48%] py-4 items-center border-red-100 bg-red-50/50">
                        <Activity size={24} color="#EF4444" className="mb-2" />
                        <Text className="text-3xl font-bold text-gray-900">{impactData.forceScore}</Text>
                        <Text className="text-xs text-red-600 font-medium">Impact Force</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <ShieldAlert size={24} color="#F59E0B" className="mb-2" />
                        <Text className="text-xl font-bold text-gray-900">{impactData.injuryProb}</Text>
                        <Text className="text-xs text-gray-500 font-medium">Injury Prob.</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <AlertTriangle size={24} color="#6366F1" className="mb-2" />
                        <Text className="text-lg font-bold text-gray-900">{impactData.fallDirection}</Text>
                        <Text className="text-xs text-gray-500 font-medium">Fall Direction</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <TrendingUp size={24} color="#10B981" className="mb-2" />
                        <Text className="text-2xl font-bold text-gray-900">{impactData.tiltAngle}°</Text>
                        <Text className="text-xs text-gray-500 font-medium">Tilt Angle</Text>
                    </Card>
                </View>

                {/* Chart Placeholder (Custom Visual) */}
                <Card className="mb-6 p-4 pb-8">
                    <SectionTitle title="Impact Force Timeline" className="mb-6" />
                    <View className="h-48 flex-row items-end justify-between px-2">
                        {/* Simple Bar representation */}
                        {chartData.map((item, index) => (
                            <View key={index} className="items-center gap-2">
                                <View
                                    className="w-8 rounded-t-sm bg-red-400 opacity-80"
                                    style={{ height: `${(item.value / 10) * 100}%` }}
                                />
                                <Text className="text-[10px] text-gray-400">{item.label}</Text>
                            </View>
                        ))}
                    </View>
                </Card>

                {/* History List */}
                <SectionTitle title="Impact History" />
                <View>
                    <Card className="flex-row justify-between items-center mb-2 p-3">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                                <Activity size={20} color="#EF4444" />
                            </View>
                            <View>
                                <Text className="font-bold text-gray-900">High Impact Detected</Text>
                                <Text className="text-xs text-gray-500">10:10 AM • 8.5g Force</Text>
                            </View>
                        </View>
                        <Text className="text-red-500 font-bold text-xs">CRITICAL</Text>
                    </Card>

                    <Card className="flex-row justify-between items-center mb-2 p-3">
                        <View className="flex-row items-center gap-3">
                            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                                <Activity size={20} color="#3B82F6" />
                            </View>
                            <View>
                                <Text className="font-bold text-gray-900">Minor Bump</Text>
                                <Text className="text-xs text-gray-500">10:05 AM • 3.0g Force</Text>
                            </View>
                        </View>
                        <Text className="text-blue-500 font-bold text-xs">LOW</Text>
                    </Card>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
