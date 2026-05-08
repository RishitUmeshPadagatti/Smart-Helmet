import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Camera, RefreshCw } from 'lucide-react-native';
import { Header } from '../components/Header';
import { Text } from '../components/Text';
import { backendAddress } from '@/constants/values';

export default function LiveCamScreen() {
    const [frame, setFrame] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const connect = () => {
        setConnected(false);
        setError(null);
        const ws = new WebSocket(`ws://${backendAddress}:8080`);

        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const byteArray = new Uint8Array(event.data);
                let binary = '';
                for (let i = 0; i < byteArray.byteLength; i++) {
                    binary += String.fromCharCode(byteArray[i]);
                }
                const base64 = btoa(binary);
                setFrame(`data:image/jpeg;base64,${base64}`);
            } catch (err) {
                console.error("Error processing frame:", err);
            }
        };

        ws.onerror = (e) => {
            console.error("WebSocket error:", e);
            setError("Failed to connect to camera");
            setConnected(false);
        };

        ws.onclose = () => {
            setConnected(false);
        };

        return ws;
    };

    useEffect(() => {
        const ws = connect();
        return () => ws.close();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-black" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex-row items-center px-4 py-3 bg-black border-b border-gray-800">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={28} color="#ffffff" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-white">Live Helmet Feed</Text>
                    <View className="flex-row items-center">
                        <View className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <Text className="text-xs text-gray-400">{connected ? 'Live' : 'Disconnected'}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => connect()} className="p-2">
                    <RefreshCw size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 items-center justify-center bg-black">
                {frame ? (
                    <Image
                        source={{ uri: frame }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                ) : (
                    <View className="items-center px-10">
                        {error ? (
                            <>
                                <View className="w-20 h-20 rounded-full bg-red-900/20 items-center justify-center mb-4">
                                    <Camera size={40} color="#ef4444" />
                                </View>
                                <Text variant="destructive" className="text-center mb-2">{error}</Text>
                                <Text variant="muted" className="text-center text-gray-400">
                                    Make sure the helmet is powered on and connected to the same network.
                                </Text>
                            </>
                        ) : (
                            <>
                                <ActivityIndicator color="#3b82f6" size="large" className="mb-4" />
                                <Text className="text-gray-400">Establishing secure link...</Text>
                                <Text className="text-xs text-gray-600 mt-2">{backendAddress}:8080</Text>
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* Overlay Info */}
            <View className="absolute bottom-10 left-4 right-4 bg-black/40 p-4 rounded-xl backdrop-blur-md border border-white/10">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-white font-medium">Helmet Camera 01</Text>
                        <Text className="text-gray-400 text-xs">Standard Field of View</Text>
                    </View>
                    <View className="bg-white/10 px-2 py-1 rounded">
                        <Text className="text-white text-[10px] font-bold">480P</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    fullImage: {
        width: '100%',
        height: '100%',
    }
});