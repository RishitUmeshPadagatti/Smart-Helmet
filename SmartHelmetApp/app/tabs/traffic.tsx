import { View, ScrollView, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { Button } from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, UploadCloud, ChevronRight, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { incidents as INITIAL_INCIDENTS, TrafficIncident } from '../../lib/mockData';

const screenWidth = Dimensions.get('window').width;

export default function Traffic() {
    const router = useRouter();
    const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadIncidents();
    }, []);

    // Reload incidents when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadIncidents();
        }, [])
    );

    const loadIncidents = async () => {
        try {
            const stored = await AsyncStorage.getItem('trafficIncidents');
            if (stored) {
                const parsed = JSON.parse(stored);
                setIncidents(parsed);
            } else {
                // Initialize with default incidents
                await saveIncidents(INITIAL_INCIDENTS);
                setIncidents(INITIAL_INCIDENTS);
            }
        } catch (error) {
            console.error('Failed to load traffic incidents:', error);
            setIncidents(INITIAL_INCIDENTS);
        } finally {
            setLoading(false);
        }
    };

    const saveIncidents = async (incidentsToSave: TrafficIncident[]) => {
        try {
            await AsyncStorage.setItem('trafficIncidents', JSON.stringify(incidentsToSave));
        } catch (error) {
            console.error('Failed to save traffic incidents:', error);
        }
    };

    const handleUpload = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission needed', 'Please allow media library access to select a video.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsMultipleSelection: false,
                quality: 1,
            });

            if (result.canceled) {
                return;
            }

            // Create a new dummy incident tied to video3
            const newIncident: TrafficIncident = {
                id: `tra-${Date.now()}`,
                type: 'Signal Jump',
                timestamp: new Date().toISOString(),
                severity: 'Medium',
                location: 'Signal point B, MG Road',
                numberPlate: 'KA 51 MP 9999',
                thumbnail: 'https://images.unsplash.com/photo-1592126296549-0e3edb40aca1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHRyYWZmaWMlMjB2aW9sYXRpb258ZW58MHx8MHx8fDA%3D',
                videoPath: 'video3'
            };

            const updatedIncidents = [newIncident, ...incidents];
            setIncidents(updatedIncidents);
            await saveIncidents(updatedIncidents);

            // Navigate to the new incident detail
            router.push(`/traffic/${newIncident.id}` as any);
        } catch (error) {
            console.error('Upload failed:', error);
            Alert.alert('Error', 'Failed to add the selected video. Please try again.');
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    };


    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
            <Header title="Traffic Management" />

            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Upload Section */}
                <Card className="mb-8 p-6 items-center border-dashed border-2 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-neutral-900">
                    <View className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
                        <UploadCloud size={32} color="#3B82F6" />
                    </View>
                    <Text className="text-lg font-bold mb-1">Upload Violation Data</Text>
                    <Text className="text-center text-sm mb-4" variant="muted">
                        Sync helmet footage to detect and report traffic violations.
                    </Text>
                    <Button
                        title="Upload New Data"
                        onPress={handleUpload}
                        className="w-full"
                    />
                </Card>

                {/* History List */}
                <SectionTitle title="Recent Violations" />
                {loading ? (
                    <View className="py-8 items-center">
                        <Text variant="muted">Loading violations...</Text>
                    </View>
                ) : incidents.length === 0 ? (
                    <View className="py-8 items-center">
                        <Text variant="muted">No violations recorded yet</Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        {incidents.map((incident) => (
                            <TouchableOpacity
                                key={incident.id}
                                onPress={() => router.push(`/traffic/${incident.id}` as any)}
                            >
                                <Card className="flex-row justify-between items-center p-0 overflow-hidden">
                                    <View className="flex-row items-center flex-1">
                                        <Image
                                            source={{ uri: incident.thumbnail }}
                                            className="w-20 h-20 bg-gray-200"
                                        />
                                        <View className="p-3 flex-1">
                                            <Text className="font-bold text-base">{incident.type}</Text>
                                            <Text className="text-xs" variant="muted">
                                                {formatDate(incident.timestamp)}
                                            </Text>
                                            <Text className="text-xs mt-1" variant="muted">
                                                {incident.location}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="pr-4">
                                        <ChevronRight size={16} color="#9CA3AF" />
                                    </View>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
