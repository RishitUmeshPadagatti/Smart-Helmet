import { View, ScrollView, Switch, Image, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../../components/Text';
import Slider from '@react-native-community/slider';
import { AddFamilyMemberModal } from '../../components/AddFamilyMemberModal';
import { Header } from '../../components/Header';
import { ListItem } from '../../components/ListItem';
import { SectionTitle } from '../../components/SectionTitle';
import { Button } from '../../components/Button';
import { useUser } from '../../context/UserContext';
import { useUserData } from '../hooks/useUserData';
import { currentUser } from '../../lib/mockData';
import { User, Bell, Shield, Phone, Zap, Volume2, Info, LogOut, X, Plus, Trash2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
    const { familyMembers, helmetVolume, addFamilyMember, removeFamilyMember, updateHelmetVolume } = useUser();
    const { userData, loading, error, updateUserData } = useUserData();

    const [autoSOS, setAutoSOSState] = useState(true);
    const [autoRecord, setAutoRecordState] = useState(true);
    const [smsAlert, setSmsAlertState] = useState(false);
    const [notifications, setNotificationsState] = useState(true);

    const setAutoSOS = async (value: boolean) => {
        setAutoSOSState(value);
        await AsyncStorage.setItem('autoSOS', JSON.stringify(value));
    };

    const setAutoRecord = async (value: boolean) => {
        setAutoRecordState(value);
        await AsyncStorage.setItem('autoRecord', JSON.stringify(value));
    };

    const setSmsAlert = async (value: boolean) => {
        setSmsAlertState(value);
        await AsyncStorage.setItem('smsAlert', JSON.stringify(value));
    };

    const setNotifications = async (value: boolean) => {
        setNotificationsState(value);
        await AsyncStorage.setItem('notifications', JSON.stringify(value));
    };

    const [loadingSettings, setLoadingSettings] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [storedAutoSOS, storedAutoRecord, storedSmsAlert, storedNotifications] = await Promise.all([
                    AsyncStorage.getItem('autoSOS'),
                    AsyncStorage.getItem('autoRecord'),
                    AsyncStorage.getItem('smsAlert'),
                    AsyncStorage.getItem('notifications'),
                ]);

                if (storedAutoSOS !== null) setAutoSOSState(JSON.parse(storedAutoSOS));
                if (storedAutoRecord !== null) setAutoRecordState(JSON.parse(storedAutoRecord));
                if (storedSmsAlert !== null) setSmsAlertState(JSON.parse(storedSmsAlert));
                if (storedNotifications !== null) setNotificationsState(JSON.parse(storedNotifications));
            } catch (e) {
                console.error("Failed to load settings", e);
            } finally {
                setLoadingSettings(false);
            }
        };

        loadSettings();
    }, []);

    // Helmet Volume State
    const [isVolumeModalVisible, setIsVolumeModalVisible] = useState(false);

    // Edit Profile State
    const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
    const [editName, setEditName] = useState(userData?.name || '');
    const [editRfid, setEditRfid] = useState(userData?.rfid || '');
    const [editPhoneNumber, setEditPhoneNumber] = useState('');

    // Add Family Member State
    const [isAddFamilyVisible, setIsAddFamilyVisible] = useState(false);

    const handleSaveProfile = async () => {
        if (userData) {
            await updateUserData({
                ...userData,
                name: editName,
                rfid: editRfid,
            });
            setIsEditProfileVisible(false);
        }
    };



    if (loading || !userData) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black">
                <Header title="Settings" />
                <View className="flex-1 items-center justify-center">
                    <Text variant="muted">Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-black" edges={['top']}>
            <Header title="Settings" />
            <ScrollView
                className="flex-1 px-4 py-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >

                {/* Profile Section */}
                <View className="items-center mb-8 mt-2">
                    <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 mb-3 overflow-hidden border-4 border-white dark:border-gray-800 shadow-sm">
                        <Image source={{ uri: currentUser.avatarUrl }} className="w-full h-full" />
                    </View>
                    <Text className="text-xl font-bold">{currentUser.name}</Text>
                    <Text className="text-sm" variant="muted">{userData.rfid}</Text>
                    <Button
                        variant="outline"
                        size="sm"
                        title="Edit Profile"
                        className="mt-3 h-8"
                        onPress={() => {
                            setEditName(userData.name);
                            setEditRfid(userData.rfid);
                            setIsEditProfileVisible(true);
                        }}
                    />
                </View>

                {/* Helmet Settings */}
                <SectionTitle title="Helmet Configuration" />
                <View className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 shadow-md shadow-black/5 dark:shadow-none elevation-2">
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                        <View className="flex-row items-center gap-3">
                            <Shield size={20} color="#4F46E5" />
                            <Text className="text-base font-medium">Auto SOS</Text>
                        </View>
                        <Switch value={autoSOS} onValueChange={setAutoSOS} trackColor={{ true: '#4F46E5' }} />
                    </View>

                    <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                        <View className="flex-row items-center gap-3">
                            <VideoIcon size={20} color="#4F46E5" />
                            <Text className="text-base font-medium">Auto IIRS Recording</Text>
                        </View>
                        <Switch value={autoRecord} onValueChange={setAutoRecord} trackColor={{ true: '#4F46E5' }} />
                    </View>

                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                            <Phone size={20} color="#4F46E5" />
                            <Text className="text-base font-medium">SMS on Crash</Text>
                        </View>
                        <Switch value={smsAlert} onValueChange={setSmsAlert} trackColor={{ true: '#4F46E5' }} />
                    </View>
                </View>

                {/* App Settings */}
                <SectionTitle title="App Preferences" />
                <View className="mb-6">
                    <View className="flex-row items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-gray-800 rounded-t-xl">
                        <View className="flex-row items-center gap-3">
                            <Bell size={20} color="#666" />
                            <Text className="text-base font-medium">Notifications</Text>
                        </View>
                        <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: '#4F46E5' }} />
                    </View>
                    <ListItem className="rounded-t-none border-t-0" icon={Zap} label="Units" value="km/h" onPress={() => { }} />
                    <ListItem
                        icon={Volume2}
                        label="Helmet Volume"
                        value={`${helmetVolume ?? 80}%`}
                        onPress={() => setIsVolumeModalVisible(true)}
                    />
                </View>

                {/* Management */}
                <SectionTitle title="Management" />
                <View className="mb-6 bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-md shadow-black/5 elevation-2">
                    <View className="p-4 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
                        <Text className="font-medium">Family Members</Text>
                        <TouchableOpacity onPress={() => setIsAddFamilyVisible(true)}>
                            <Plus size={20} color="#4F46E5" />
                        </TouchableOpacity>
                    </View>
                    {familyMembers.map((member) => (
                        <View key={member.id} className="p-4 border-b border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
                            <View>
                                <Text className="font-medium">{member.name}</Text>
                                <Text className="text-xs" variant="muted">{member.status}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFamilyMember(member.id)}>
                                <Trash2 size={18} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {familyMembers.length === 0 && (
                        <View className="p-4">
                            <Text variant="muted" className="text-center">No family members added</Text>
                        </View>
                    )}
                </View>
                <View className="mb-6">
                    <ListItem icon={Info} label="About & Help" onPress={() => { }} />
                </View>

                <Button variant="destructive" title="Log Out" className="mt-4 mb-8" />

            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditProfileVisible}
                onRequestClose={() => setIsEditProfileVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold">Edit Profile</Text>
                                <TouchableOpacity onPress={() => setIsEditProfileVisible(false)}>
                                    <X size={24} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="mb-4">
                                    <Text className="text-sm font-medium mb-2">Name</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-gray-900 dark:text-white"
                                        value={editName}
                                        onChangeText={setEditName}
                                        placeholder="Enter your name"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View className="mb-4">
                                    <Text className="text-sm font-medium mb-2">RFID Tag</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-gray-900 dark:text-white"
                                        value={editRfid}
                                        onChangeText={setEditRfid}
                                        placeholder="Enter RFID"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>

                                <View className="mb-6">
                                    <Text className="text-sm font-medium mb-2">Phone Number</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-gray-900 dark:text-white"
                                        value={editPhoneNumber}
                                        onChangeText={setEditPhoneNumber}
                                        placeholder="Enter Phone Number"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="phone-pad"
                                    />
                                </View>

                                <Button title="Save Changes" onPress={handleSaveProfile} />
                                <View className="h-8" />
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Add Family Member Modal */}
            <AddFamilyMemberModal
                visible={isAddFamilyVisible}
                onClose={() => setIsAddFamilyVisible(false)}
                onAdd={(member) => {
                    addFamilyMember({
                        ...member,
                        location: { lat: 0, lng: 0 } // Default location
                    });
                }}
            />

            {/* Volume Control Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isVolumeModalVisible}
                onRequestClose={() => setIsVolumeModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm items-center">
                        <Text className="text-xl font-bold mb-6">Helmet Volume</Text>

                        <View className="w-full items-center mb-8">
                            <Text variant="primary" className="text-4xl font-bold mb-4">
                                {helmetVolume ?? 80}%
                            </Text>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={helmetVolume ?? 80}
                                onValueChange={(value) => updateHelmetVolume(value)}
                                minimumTrackTintColor="#4F46E5"
                                maximumTrackTintColor="#E5E7EB"
                                thumbTintColor="#4F46E5"
                            />
                        </View>

                        <Button title="Done" onPress={() => setIsVolumeModalVisible(false)} className="w-full" />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function VideoIcon(props: any) {
    // Quick fix for missing import or reuse Camera icon
    return <Zap {...props} />;
}
