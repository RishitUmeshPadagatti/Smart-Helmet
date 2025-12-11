import { View, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { incidents } from '../../lib/mockData';
import { Camera, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

// Camera Server Configuration
const CAMERA_SERVER_URL = 'http://192.168.1.100:3001';

export default function IIRS() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [latestFrame, setLatestFrame] = useState(null);
    const [error, setError] = useState(null);
    let frameInterval;

    // Start camera stream
    const startCamera = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${CAMERA_SERVER_URL}/camera/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setIsStreaming(true);
                captureFrames();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(`Failed to connect: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Stop camera stream
    const stopCamera = async () => {
        setIsLoading(true);
        try {
            clearInterval(frameInterval);
            const response = await fetch(`${CAMERA_SERVER_URL}/camera/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setIsStreaming(false);
                setLatestFrame(null);
                setError(null);
            }
        } catch (err) {
            setError(`Failed to stop: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Capture frames continuously
    const captureFrames = () => {
        const capture = async () => {
            try {
                const response = await fetch(`${CAMERA_SERVER_URL}/camera/frame`);
                const data = await response.json();
                if (data.success && data.frameData) {
                    setLatestFrame(data.frameData);
                }
            } catch (err) {
                console.error('Frame capture error:', err);
            }
        };
        frameInterval = setInterval(capture, 100);
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (frameInterval) clearInterval(frameInterval);
        };
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
            <Header title="IIRS System" />
            <ScrollView
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Live Preview */}
                <View className="w-full h-56 bg-black rounded-2xl overflow-hidden mb-4 relative shadow-md shadow-black/20 elevation-4">
                    {isStreaming && latestFrame ? (
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${latestFrame}` }}
                            className="w-full h-full"
                        />
                    ) : (
                        <>
                            <Image
                                source={{ uri: "https://images.unsplash.com/photo-1595182903337-95192c483c2e?q=80&w=600&auto=format&fit=crop" }}
                                className="w-full h-full opacity-60"
                            />
                            <View className="absolute inset-0 items-center justify-center">
                                <Camera size={40} color="white" className="opacity-80" />
                                <Text className="text-white font-medium mt-2">
                                    {error ? 'Connection Error' : 'Live Camera Feed'}
                                </Text>
                            </View>
                        </>
                    )}
                    
                    {isStreaming && (
                        <View className="absolute top-3 right-3 bg-red-500 px-2 py-1 rounded-md flex-row items-center gap-1">
                            <View className="w-2 h-2 rounded-full bg-white animate-pulse" />
                            <Text className="text-white text-xs font-bold">LIVE</Text>
                        </View>
                    )}
                </View>

                {/* Error Display */}
                {error && (
                    <View className="w-full bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                        <Text className="text-red-700 text-sm">{error}</Text>
                    </View>
                )}

                {/* Controls */}
                <View className="flex-row gap-3 mb-8">
                    <Button 
                        className={`flex-1 ${isStreaming ? 'bg-red-500' : 'bg-green-500'}`}
                        title={isLoading ? '...' : (isStreaming ? 'Stop Recording' : 'Start Recording')}
                        onPress={isStreaming ? stopCamera : startCamera}
                        disabled={isLoading}
                    />
                    <Button className="flex-1" variant="outline" title="Settings" />
                </View>

                {/* Incidents List */}
                <Text className="text-lg font-bold mb-3">Incident Reports</Text>

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
