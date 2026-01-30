import { View, ScrollView, TouchableOpacity, Alert, Image, Share, Modal, Dimensions } from 'react-native';
import { Button } from '../../components/Button';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldAlert, ChevronLeft, Trash2, MapPin, Clock, Share2, CheckCircle, AlertTriangle, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { WasteIncident } from '../../lib/mockData';

export default function WasteIncidentDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [incident, setIncident] = useState<WasteIncident | null>(null);
    const [loading, setLoading] = useState(true);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);

    useEffect(() => {
        loadIncident();
    }, [id]);

    const loadIncident = async () => {
        try {
            const stored = await AsyncStorage.getItem('wasteIncidents');
            if (stored) {
                const incidents: WasteIncident[] = JSON.parse(stored);
                const found = incidents.find(inc => inc.id === id);
                if (found) {
                    setIncident(found);
                }
            }
        } catch (error) {
            console.error('Failed to load waste incident:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Record',
            'Are you sure you want to delete this waste report?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const stored = await AsyncStorage.getItem('wasteIncidents');
                            if (stored) {
                                const incidents: WasteIncident[] = JSON.parse(stored);
                                const filtered = incidents.filter(inc => inc.id !== id);
                                await AsyncStorage.setItem('wasteIncidents', JSON.stringify(filtered));
                                router.back();
                            }
                        } catch (error) {
                            console.error('Failed to delete incident:', error);
                            Alert.alert('Error', 'Failed to delete record.');
                        }
                    },
                },
            ]
        );
    };

    const handleShare = async () => {
        if (!incident) return;
        try {
            const message = `Waste Management Report:\nType: ${incident.type}\nLocation: ${incident.location}\nTime: ${new Date(incident.timestamp).toLocaleString()}\nImage: ${incident.thumbnail}`;
            await Share.share({
                message,
                title: 'Waste Management Report',
            });
        } catch (error) {
            console.error('Error sharing report:', error);
            Alert.alert('Error', 'Failed to share report.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom', 'left', 'right']}>
                <Stack.Screen options={{ headerShown: false }} />
                <Header title="Loading..." />
                <View className="flex-1 items-center justify-center">
                    <Text variant="muted">Loading report details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!incident) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom', 'left', 'right']}>
                <Stack.Screen options={{ headerShown: false }} />
                <Header title="Not Found" />
                <View className="flex-1 items-center justify-center">
                    <Text variant="muted">Report not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header
                title="Waste Report"
                leftContent={
                    <TouchableOpacity onPress={() => router.back()} className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                        <ChevronLeft size={24} color="#6B7280" />
                    </TouchableOpacity>
                }
                rightContent={
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="p-1 rounded-full bg-red-100 dark:bg-red-900/30"
                        >
                            <Trash2 size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Detection Result Banner */}
                {incident.garbageDetected !== undefined && (
                    <Card className={`mb-4 p-4 flex-row items-center ${incident.garbageDetected ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                        {incident.garbageDetected ? (
                            <AlertTriangle size={24} color="#EF4444" />
                        ) : (
                            <CheckCircle size={24} color="#10B981" />
                        )}
                        <View className="ml-3 flex-1">
                            <Text className={`font-bold ${incident.garbageDetected ? 'text-red-600' : 'text-green-600'}`}>
                                {incident.garbageDetected ? 'Garbage Detected' : 'Area is Clean'}
                            </Text>
                            <Text className="text-xs" variant="muted">
                                Confidence: {((incident.confidence || 0) * 100).toFixed(1)}%
                            </Text>
                        </View>
                    </Card>
                )}

                {/* Evidence Snapshot */}
                <SectionTitle title="Analyzed Image" className="mb-3" />
                <TouchableOpacity activeOpacity={0.9} onPress={() => setIsImageFullscreen(true)}>
                    <Card className="mb-6 p-0 overflow-hidden border-gray-200 dark:border-gray-800 bg-black">
                        <Image
                            source={{ uri: incident.annotatedImageUrl || incident.thumbnail }}
                            className="w-full h-64"
                            resizeMode="contain"
                        />
                        {/* Tap to expand hint */}
                        <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded">
                            <Text className="text-white text-xs">Tap to expand</Text>
                        </View>
                    </Card>
                </TouchableOpacity>

                {/* Fullscreen Image Modal */}
                <Modal
                    visible={isImageFullscreen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setIsImageFullscreen(false)}
                >
                    <View className="flex-1 bg-black justify-center items-center">
                        <TouchableOpacity
                            onPress={() => setIsImageFullscreen(false)}
                            className="absolute top-12 right-4 z-20 bg-white/20 rounded-full p-2"
                        >
                            <X size={28} color="white" />
                        </TouchableOpacity>
                        <Image
                            source={{ uri: incident.annotatedImageUrl || incident.thumbnail }}
                            style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>

                {/* Incident Details */}
                <SectionTitle title="Report Details" className="mb-3" />
                <View className="flex-row flex-wrap gap-3 mb-6">
                    <Card className="w-[48%] py-4 items-center">
                        {incident.garbageDetected ? (
                            <AlertTriangle size={24} color="#EF4444" className="mb-2" />
                        ) : (
                            <CheckCircle size={24} color="#10B981" className="mb-2" />
                        )}
                        <Text className="text-lg font-bold text-center">{incident.type}</Text>
                        <Text className="text-xs font-medium" variant="muted">Detection Result</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <Clock size={24} color="#6366F1" className="mb-2" />
                        <Text className="text-sm font-bold text-center">
                            {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text className="text-xs font-medium" variant="muted">Time Analyzed</Text>
                    </Card>

                    <Card className="w-full py-4 items-center px-4 flex-row gap-4">
                        <MapPin size={24} color="#10B981" />
                        <View className="flex-1">
                            <Text className="text-sm font-bold" numberOfLines={2}>{incident.location}</Text>
                            <Text className="text-xs font-medium" variant="muted">Location</Text>
                        </View>
                    </Card>
                </View>

                {/* Share Report */}
                <Button
                    onPress={handleShare}
                    variant="outline"
                    className="mt-2 bg-white border-gray-200"
                >
                    <Share2 size={20} color="#000000" />
                    <Text className="text-black dark:text-black font-medium ml-2">Share Report</Text>
                </Button>
            </ScrollView>
        </SafeAreaView>
    );
}
