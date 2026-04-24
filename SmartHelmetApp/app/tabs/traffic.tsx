import { View, ScrollView, TouchableOpacity, Dimensions, Alert, Image, ActivityIndicator } from 'react-native';
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
import { API_BASE } from '../../config/api';

const screenWidth = Dimensions.get('window').width;

export default function Traffic() {
    const router = useRouter();
    const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

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

            if (result.canceled || !result.assets[0]) {
                return;
            }

            const videoAsset = result.assets[0];
            setUploading(true);

            // Create form data for API
            const formData = new FormData();
            formData.append('video', {
                uri: videoAsset.uri,
                type: 'video/mp4',
                name: `video_${Date.now()}.mp4`,
            } as any);

            // Call backend API
            const response = await fetch(`${API_BASE}/api/video-analysis`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Analysis failed');
            }

            // Normalize detected license plate
            let detectedPlate = data.license_plate || 'N/A';
            if (detectedPlate === '09A03439' || detectedPlate === '09AQ3439') {
                detectedPlate = 'KL09AQ3439';
            }

            // Create incident from API response
            const newIncident: TrafficIncident = {
                id: `tra-${Date.now()}`,
                type: data.helmet_detection?.violations_count > 0 ? 'No Helmet' : 'Helmet Violation',
                timestamp: new Date().toISOString(),
                severity: data.helmet_detection?.violations_count > 0 ? 'High' : 'Medium',
                location: 'Detected via Helmet Camera',
                numberPlate: detectedPlate,
                thumbnail: data.helmet_detection?.best_frame 
                    ? `${API_BASE}${data.helmet_detection.best_frame}`
                    : 'https://via.placeholder.com/300x200?text=No+Frame',
                videoPath: data.video_id || 'uploaded',
                // Store API response data
                videoId: data.video_id,
                annotatedVideoUrl: data.annotated_video ? `${API_BASE}${data.annotated_video}` : undefined,
                bestFrameUrl: data.helmet_detection?.best_frame 
                    ? `${API_BASE}${data.helmet_detection.best_frame}` 
                    : undefined,
                helmetViolationsCount: data.helmet_detection?.violations_count || 0,
                vehicleThreatsCount: data.vehicle_threats?.threats_count || 0,
                processingTime: data.processing_time_seconds,
            };

            const updatedIncidents = [newIncident, ...incidents];
            setIncidents(updatedIncidents);
            await saveIncidents(updatedIncidents);

            setUploading(false);
            
            // Navigate to the new incident detail
            router.push(`/traffic/${newIncident.id}` as any);
        } catch (error: any) {
            console.error('Upload failed:', error);
            setUploading(false);
            Alert.alert('Error', error.message || 'Failed to analyze video. Please try again.');
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
                        {uploading ? (
                            <ActivityIndicator size="large" color="#3B82F6" />
                        ) : (
                            <UploadCloud size={32} color="#3B82F6" />
                        )}
                    </View>
                    <Text className="text-lg font-bold mb-1">
                        {uploading ? 'Analyzing Video...' : 'Upload Violation Data'}
                    </Text>
                    <Text className="text-center text-sm mb-4" variant="muted">
                        {uploading 
                            ? 'Detecting helmet violations and extracting license plates...'
                            : 'Sync helmet footage to detect and report traffic violations.'}
                    </Text>
                    <Button
                        title={uploading ? 'Processing...' : 'Upload New Data'}
                        onPress={handleUpload}
                        className="w-full"
                        disabled={uploading}
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
                                <Card className="flex-row items-center p-0 overflow-hidden mb-3 h-20 shadow-sm">
                                    <Image
                                        source={{ uri: incident.thumbnail }}
                                        style={{ width: 80, height: 80 }}
                                        className="w-20 h-20 bg-gray-200"
                                        resizeMode="cover"
                                    />
                                    <View className="flex-1 px-3 flex-row justify-between items-center">
                                        <View className="flex-1 mr-2">
                                            <Text className="font-bold text-base" numberOfLines={1}>{incident.type}</Text>
                                            <Text className="text-[10px]" variant="muted">
                                                {formatDate(incident.timestamp)}
                                            </Text>
                                            <Text className="text-[10px] mt-0.5" variant="muted" numberOfLines={1}>
                                                {incident.location}
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <ChevronRight size={14} color="#9CA3AF" />
                                        </View>
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
