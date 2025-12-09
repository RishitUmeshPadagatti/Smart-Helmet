import { View, Text, ScrollView, Switch, Image } from 'react-native';
import { Header } from '../../components/Header';
import { ListItem } from '../../components/ListItem';
import { SectionTitle } from '../../components/SectionTitle';
import { Button } from '../../components/Button';
import { currentUser } from '../../lib/mockData';
import { User, Bell, Shield, Phone, Zap, Volume2, Info, LogOut } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
    const [autoSOS, setAutoSOS] = useState(true);
    const [autoRecord, setAutoRecord] = useState(true);
    const [smsAlert, setSmsAlert] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Header title="Settings" />
            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Profile Section */}
                <View className="items-center mb-8 mt-2">
                    <View className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden border-4 border-white shadow-sm">
                        <Image source={{ uri: currentUser.avatarUrl }} className="w-full h-full" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">{currentUser.name}</Text>
                    <Text className="text-sm text-gray-500">{currentUser.rfid}</Text>
                    <Button variant="outline" size="sm" title="Edit Profile" className="mt-3 h-8" />
                </View>

                {/* Helmet Settings */}
                <SectionTitle title="Helmet Configuration" />
                <View className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <Shield size={20} color="#4F46E5" />
                            <Text className="text-base font-medium text-gray-700">Auto SOS</Text>
                        </View>
                        <Switch value={autoSOS} onValueChange={setAutoSOS} trackColor={{ true: '#4F46E5' }} />
                    </View>

                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                        <View className="flex-row items-center gap-3">
                            <VideoIcon size={20} color="#4F46E5" />
                            <Text className="text-base font-medium text-gray-700">Auto IIRS Recording</Text>
                        </View>
                        <Switch value={autoRecord} onValueChange={setAutoRecord} trackColor={{ true: '#4F46E5' }} />
                    </View>

                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <Phone size={20} color="#4F46E5" />
                            <Text className="text-base font-medium text-gray-700">SMS on Crash</Text>
                        </View>
                        <Switch value={smsAlert} onValueChange={setSmsAlert} trackColor={{ true: '#4F46E5' }} />
                    </View>
                </View>

                {/* App Settings */}
                <SectionTitle title="App Preferences" />
                <View className="mb-6">
                    <ListItem icon={Bell} label="Notifications" value="On" onPress={() => { }} />
                    <ListItem icon={Zap} label="Units" value="km/h" onPress={() => { }} />
                    <ListItem icon={Volume2} label="Helmet Volume" value="80%" onPress={() => { }} />
                </View>

                {/* Management */}
                <SectionTitle title="Management" />
                <View className="mb-6">
                    <ListItem icon={User} label="Family Members" onPress={() => { }} />
                    <ListItem icon={Info} label="About & Help" onPress={() => { }} />
                </View>

                <Button variant="destructive" title="Log Out" className="mt-4 mb-8" />

            </ScrollView>
        </SafeAreaView>
    );
}

function VideoIcon(props: any) {
    // Quick fix for missing import or reuse Camera icon
    return <Zap {...props} />;
}
