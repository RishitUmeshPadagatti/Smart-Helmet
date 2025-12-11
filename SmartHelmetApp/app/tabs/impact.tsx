import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '../../components/Text';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { SectionTitle } from '../../components/SectionTitle';
import { Button } from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, UploadCloud, ChevronRight } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function Impact() {
    const router = useRouter();

    const handleUpload = () => {
        console.log("Uploading Impact Data...");
        // In real app, this would pick a file or sync with helmet
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
            <Header title="Impact History" />

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
                    <Text className="text-lg font-bold mb-1">Upload Impact Data</Text>
                    <Text className="text-center text-sm mb-4" variant="muted">
                        Sync data from your smart helmet to analyze latest impacts.
                    </Text>
                    <Button
                        title="Upload New Data"
                        onPress={handleUpload}
                        className="w-full"
                    />
                </Card>

                {/* History List */}
                <SectionTitle title="Recent Activity" />
                <View className="gap-3">
                    {/* Item 1 */}
                    <TouchableOpacity onPress={() => router.push('/impact/123')}>
                        <Card className="flex-row justify-between items-center p-4">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                                    <Activity size={24} color="#EF4444" />
                                </View>
                                <View>
                                    <Text className="font-bold text-base">High Impact Detected</Text>
                                    <Text className="text-xs" variant="muted">Today, 10:10 AM • 8.5g Force</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="font-bold text-xs mb-1" variant="destructive">CRITICAL</Text>
                                <ChevronRight size={16} color="#9CA3AF" />
                            </View>
                        </Card>
                    </TouchableOpacity>

                    {/* Item 2 */}
                    <TouchableOpacity onPress={() => router.push('/impact/124')}>
                        <Card className="flex-row justify-between items-center p-4">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                                    <Activity size={24} color="#3B82F6" />
                                </View>
                                <View>
                                    <Text className="font-bold text-base">Minor Bump</Text>
                                    <Text className="text-xs" variant="muted">Yesterday, 4:05 PM • 3.0g Force</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-blue-500 font-bold text-xs mb-1">LOW</Text>
                                <ChevronRight size={16} color="#9CA3AF" />
                            </View>
                        </Card>
                    </TouchableOpacity>

                    {/* Item 3 */}
                    <TouchableOpacity onPress={() => router.push('/impact/125')}>
                        <Card className="flex-row justify-between items-center p-4">
                            <View className="flex-row items-center gap-4">
                                <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
                                    <Activity size={24} color="#6B7280" />
                                </View>
                                <View>
                                    <Text className="font-bold text-base">Routine Check</Text>
                                    <Text className="text-xs" variant="muted">Oct 20, 9:00 AM • 0.5g Force</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-gray-500 font-bold text-xs mb-1">NORMAL</Text>
                                <ChevronRight size={16} color="#9CA3AF" />
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
