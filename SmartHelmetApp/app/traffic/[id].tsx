import { View, ScrollView, TouchableOpacity, Alert, Image, Share, Linking, Modal, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { Button } from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, ShieldAlert, PlayCircle, ChevronLeft, Trash2, MapPin, Clock, CreditCard, Share2, Video as VideoIcon, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { TrafficIncident } from '../../lib/mockData';
import { API_BASE } from '../../config/api';

const VIDEO_MAP: Record<string, any> = {
    'video1': require('../../assets/videos/video1_impact.mp4'),
    'video2': require('../../assets/videos/video2_impact.mp4'),
    'video3': require('../../assets/videos/video3_impact.mp4'),
};

export default function TrafficIncidentDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [incident, setIncident] = useState<TrafficIncident | null>(null);
    const [loading, setLoading] = useState(true);
    const [videoRef, setVideoRef] = useState<Video | null>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isImageFullscreen, setIsImageFullscreen] = useState(false);

    useEffect(() => {
        loadIncident();
    }, [id]);

    const loadIncident = async () => {
        try {
            const stored = await AsyncStorage.getItem('trafficIncidents');
            if (stored) {
                const incidents: TrafficIncident[] = JSON.parse(stored);
                const found = incidents.find(inc => inc.id === id);
                if (found) {
                    setIncident(found);
                }
            }
        } catch (error) {
            console.error('Failed to load traffic incident:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Record',
            'Are you sure you want to delete this traffic violation record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const stored = await AsyncStorage.getItem('trafficIncidents');
                            if (stored) {
                                const incidents: TrafficIncident[] = JSON.parse(stored);
                                const filtered = incidents.filter(inc => inc.id !== id);
                                await AsyncStorage.setItem('trafficIncidents', JSON.stringify(filtered));
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

    const handlePlayVideo = async () => {
        if (!videoRef || !incident) return;

        try {
            // Reset video to start first
            await videoRef.setPositionAsync(0);
            
            // Set up playback status listener to detect when video stops or finishes
            videoRef.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
                if (status.isLoaded) {
                    // When video finishes or is paused/stopped, reset the play button
                    if (status.didJustFinish) {
                        setIsVideoPlaying(false);
                        videoRef.setPositionAsync(0); // Reset to start for replay
                    } else if (!status.isPlaying && status.positionMillis > 0) {
                        // Video paused or fullscreen dismissed
                        setIsVideoPlaying(false);
                    }
                }
            });
            
            // Start playing and go fullscreen
            await videoRef.playAsync();
            await videoRef.presentFullscreenPlayer();
            setIsVideoPlaying(true);
        } catch (error) {
            console.error('Error playing video:', error);
            Alert.alert('Error', 'Failed to play video.');
            setIsVideoPlaying(false);
        }
    };

    const handleShare = async () => {
        if (!incident) return;
        try {
            const subject = 'Traffic Violation Report';
            const body = `Traffic Violation Report:\n\nType: ${incident.type}\nVehicle: ${incident.numberPlate}\nLocation: ${incident.location}\nTime: ${new Date(incident.timestamp).toLocaleString()}\nEvidence: ${incident.thumbnail}`;
            const email = 'rishitpadagatti@gmail.com';
            const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            const canOpen = await Linking.canOpenURL(mailtoUrl);
            if (canOpen) {
                await Linking.openURL(mailtoUrl);
            } else {
                Alert.alert('Error', 'No email app available on this device.');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            Alert.alert('Error', 'Failed to open email app.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom', 'left', 'right']}>
                <Stack.Screen options={{ headerShown: false }} />
                <Header title="Loading..." />
                <View className="flex-1 items-center justify-center">
                    <Text variant="muted">Loading incident details...</Text>
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
                    <Text variant="muted">Incident not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black" edges={['top', 'bottom', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />
            <Header
                title="Violation Report"
                leftContent={
                    <TouchableOpacity onPress={() => router.back()} className="p-1 rounded-full bg-gray-100 dark:bg-gray-800">
                        <ChevronLeft size={24} color="#6B7280" />
                    </TouchableOpacity>
                }
                rightContent={
                    <TouchableOpacity
                        onPress={handleDelete}
                        className="p-1 rounded-full bg-red-100 dark:bg-red-900/30"
                    >
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                }
            />

            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Video Playback - Annotated Video with Play Button */}
                <SectionTitle title="Violation Video" className="mb-3" />
                <Card className="mb-6 p-0 overflow-hidden h-56 bg-black justify-center items-center relative">
                    {incident.annotatedVideoUrl ? (
                        // Use annotated video from API with play button overlay
                        <>
                            <Video
                                ref={(ref) => setVideoRef(ref)}
                                source={{ uri: incident.annotatedVideoUrl }}
                                className="w-full h-full"
                                resizeMode={ResizeMode.CONTAIN}
                                useNativeControls={false}
                                shouldPlay={false}
                            />
                            {!isVideoPlaying && (
                                <TouchableOpacity
                                    onPress={handlePlayVideo}
                                    className="absolute z-10 items-center"
                                    activeOpacity={0.8}
                                >
                                    <View className="bg-black/60 rounded-full p-4">
                                        <PlayCircle size={52} color="white" />
                                    </View>
                                    <Text className="text-white font-bold mt-2 text-base">Play Annotated Video</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : VIDEO_MAP[incident.videoPath] ? (
                        // Fallback to bundled video
                        <>
                            <Video
                                ref={(ref) => setVideoRef(ref)}
                                source={VIDEO_MAP[incident.videoPath]}
                                className="w-full h-full"
                                resizeMode={ResizeMode.CONTAIN}
                                useNativeControls={false}
                                shouldPlay={false}
                            />
                            <TouchableOpacity
                                onPress={handlePlayVideo}
                                className="absolute z-10 items-center"
                                activeOpacity={0.8}
                            >
                                <View className="bg-black/50 rounded-full p-3">
                                    <PlayCircle size={48} color="white" />
                                </View>
                                <Text className="text-white font-medium mt-2">Watch Violation Clip</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        // No video available
                        <View className="items-center justify-center">
                            <VideoIcon size={48} color="#6B7280" />
                            <Text className="text-gray-400 mt-2">No video available</Text>
                        </View>
                    )}
                </Card>

                {/* Evidence Snapshot */}
                <SectionTitle title="Evidence Snapshot" className="mb-3" />
                <TouchableOpacity activeOpacity={0.9} onPress={() => setIsImageFullscreen(true)}>
                    <Card className="mb-6 p-0 overflow-hidden border-gray-200 dark:border-gray-800 bg-black">
                        <Image
                            source={{ uri: incident.bestFrameUrl || incident.thumbnail }}
                            className="w-full h-48"
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
                            source={{ uri: incident.bestFrameUrl || incident.thumbnail }}
                            style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }}
                            resizeMode="contain"
                        />
                    </View>
                </Modal>

                {/* Violation Details */}
                <SectionTitle title="Incident Details" className="mb-3" />
                <View className="flex-row flex-wrap gap-3 mb-6">
                    <Card className="w-[48%] py-4 items-center">
                        <ShieldAlert size={24} color="#EF4444" className="mb-2" />
                        <Text className="text-lg font-bold text-center">{incident.type}</Text>
                        <Text className="text-xs font-medium" variant="muted">Violation Type</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <CreditCard size={24} color="#3B82F6" className="mb-2" />
                        <Text className="text-lg font-bold">KL09AQ3439</Text>
                        <Text className="text-xs font-medium" variant="muted">Number Plate</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center">
                        <Clock size={24} color="#6366F1" className="mb-2" />
                        <Text className="text-sm font-bold text-center">
                            {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text className="text-xs font-medium" variant="muted">Time Detected</Text>
                    </Card>

                    <Card className="w-[48%] py-4 items-center px-2">
                        <MapPin size={24} color="#10B981" className="mb-2" />
                        <Text className="text-xs font-bold text-center" numberOfLines={2}>{incident.location}</Text>
                        <Text className="text-xs font-medium" variant="muted">Location</Text>
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
