import { View, ScrollView, Image } from 'react-native';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { incidents } from '../../lib/mockData';
import { Camera, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Traffic() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
            <Header title="Traffic Management" />
            <ScrollView
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Live Preview Placeholder */}
                <View className="w-full h-56 bg-black rounded-2xl overflow-hidden mb-4 relative shadow-md shadow-black/20 elevation-4">
                    <Image
                        source={{ uri: "https://media.istockphoto.com/id/599718046/photo/traffic-lights-different-focus.jpg?s=612x612&w=0&k=20&c=nTiGQwMezC5vOMRBOQDQeYmcrrq2_JEuVY9wqDXiJ64=" }}
                        className="w-full h-full opacity-60"
                    />
                    <View className="absolute inset-0 items-center justify-center">
                        <Camera size={40} color="white" className="opacity-80" />
                        <Text className="text-white font-medium mt-2">Live traffic Camera Feed</Text>
                    </View>
                    <View className="absolute top-3 right-3 bg-red-500 px-2 py-1 rounded-md">
                        <Text className="text-white text-xs font-bold">LIVE</Text>
                    </View>
                </View>

                {/* Traffic Violation Reports */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-bold">Traffic Violation Reports</Text>
                    <Badge variant="outline">Today</Badge>
                </View>

                <View className="gap-4">
                    {incidents.map((incident) => (
                        <Card key={incident.id} className="p-0 overflow-hidden">
                            <View className="flex-row">
                                <Image
                                    source={{ uri: incident.thumbnail }}
                                    className="w-24 h-24 bg-gray-200"
                                />
                                <View className="flex-1 p-3 justify-between">
                                    <View className="flex-row justify-between items-start">
                                        <View>
                                            <Text className="font-bold text-base">{incident.location}</Text>
                                            <View className="flex-row items-center gap-1 mt-1">
                                                <Calendar size={12} color="#888" />
                                                <Text className="text-xs" variant="muted">{new Date(incident.timestamp).toLocaleDateString()}</Text>
                                            </View>
                                        </View>
                                        <Badge
                                            variant={incident.severity === 'High' ? 'destructive' : 'warning'}
                                        >
                                            {incident.severity}
                                        </Badge>
                                    </View>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="self-end h-8 px-2"
                                    >
                                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">View Details</Text>
                                    </Button>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
