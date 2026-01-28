import { View, ScrollView, Image } from 'react-native';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Camera, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Waste() {
    const wasteReports = [
        {
            id: 'waste-1',
            location: 'Central Plaza',
            timestamp: new Date().getTime() - 3600000,
            severity: 'High',
            thumbnail: 'https://images.unsplash.com/photo-1589627762073-9aca94506fa1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        },
        {
            id: 'waste-2',
            location: 'North Street',
            timestamp: new Date().getTime() - 7200000,
            severity: 'Medium',
            thumbnail: 'https://media.istockphoto.com/id/1059301664/photo/waste-abandoned-on-the-hills.jpg?s=612x612&w=0&k=20&c=U7bjzDfcKOcCnedJG347vbFVEUei-V2JAq48sDnyq4I='
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
            <Header title="Waste Management" />
            <ScrollView
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Live Preview Placeholder */}
                <View className="w-full h-56 bg-black rounded-2xl overflow-hidden mb-4 relative shadow-md shadow-black/20 elevation-4">
                    <Image
                        source={{ uri: "https://media.istockphoto.com/id/1269748384/photo/e-waste-and-other-litter-in-the-street.jpg?s=612x612&w=0&k=20&c=WBB5vOmTVcpl01i9XWTFYQQ4yVFAQzwgfs3sf4lkhto=" }}
                        className="w-full h-full opacity-60"
                    />
                    <View className="absolute inset-0 items-center justify-center">
                        <Camera size={40} color="white" className="opacity-80" />
                        <Text className="text-white font-medium mt-2">Live Waste Monitoring Feed</Text>
                    </View>
                    <View className="absolute top-3 right-3 bg-red-500 px-2 py-1 rounded-md">
                        <Text className="text-white text-xs font-bold">LIVE</Text>
                    </View>
                </View>

                {/* Waste Violation Reports */}
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-lg font-bold">Waste violation Reports</Text>
                    <Badge variant="outline">Active</Badge>
                </View>

                <View className="gap-4">
                    {wasteReports.map((report) => (
                        <Card key={report.id} className="p-0 overflow-hidden">
                            <View className="flex-row">
                                <Image
                                    source={{ uri: report.thumbnail }}
                                    className="w-24 h-24 bg-gray-200"
                                />
                                <View className="flex-1 p-3 justify-between">
                                    <View className="flex-row justify-between items-start">
                                        <View>
                                            <Text className="font-bold text-base">{report.location}</Text>
                                            <View className="flex-row items-center gap-1 mt-1">
                                                <Calendar size={12} color="#888" />
                                                <Text className="text-xs" variant="muted">{new Date(report.timestamp).toLocaleDateString()}</Text>
                                            </View>
                                        </View>
                                        <Badge
                                            variant={report.severity === 'High' ? 'destructive' : 'warning'}
                                        >
                                            {report.severity}
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
