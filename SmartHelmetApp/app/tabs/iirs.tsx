import { View, Text, ScrollView, Image } from 'react-native';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { incidents } from '../../lib/mockData';
import { Camera, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IIRS() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Header title="IIRS System" />
            <ScrollView
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Live Preview Placeholder */}
                <View className="w-full h-56 bg-black rounded-2xl overflow-hidden mb-4 relative">
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1595182903337-95192c483c2e?q=80&w=600&auto=format&fit=crop" }}
                        className="w-full h-full opacity-60"
                    />
                    <View className="absolute inset-0 items-center justify-center">
                        <Camera size={40} color="white" className="opacity-80" />
                        <Text className="text-white font-medium mt-2">Live Camera Feed</Text>
                    </View>
                    <View className="absolute top-3 right-3 bg-red-500 px-2 py-1 rounded-md">
                        <Text className="text-white text-xs font-bold">REC</Text>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row gap-3 mb-8">
                    <Button className="flex-1 bg-red-500" title="Stop Recording" />
                    <Button className="flex-1" variant="outline" title="Settings" />
                </View>

                {/* Incidents List */}
                <Text className="text-lg font-bold text-gray-900 mb-3">Incident Reports</Text>

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
                                            <Text className="font-bold text-gray-800 text-base">{incident.location}</Text>
                                            <View className="flex-row items-center gap-1 mt-1">
                                                <Calendar size={12} color="#888" />
                                                <Text className="text-xs text-gray-500">{new Date(incident.timestamp).toLocaleDateString()}</Text>
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
                                        <Text className="text-blue-600 text-xs font-bold">View Details</Text>
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
