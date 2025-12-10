import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { Button } from './Button';
import { useState } from 'react';

interface AddFamilyMemberModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (member: { name: string; rfid: string; mobileNumber: string; status: string }) => void;
}

export function AddFamilyMemberModal({ visible, onClose, onAdd }: AddFamilyMemberModalProps) {
    const [name, setName] = useState('');
    const [rfid, setRfid] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [status, setStatus] = useState('Home');

    const handleAdd = () => {
        if (name && rfid && mobileNumber) {
            onAdd({ name, rfid, mobileNumber, status });
            setName('');
            setRfid('');
            setMobileNumber('');
            setStatus('Home');
            onClose();
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-gray-900">Add Family Member</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter name"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">RFID Tag Number</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                            value={rfid}
                            onChangeText={setRfid}
                            placeholder="Enter RFID Tag"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Mobile Number</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            placeholder="Enter Mobile Number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Status (e.g. Home, Work)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                            value={status}
                            onChangeText={setStatus}
                            placeholder="Enter status"
                        />
                    </View>

                    <Button title="Add Member" onPress={handleAdd} />
                    <View className="h-8" />
                </View>
            </View>
        </Modal>
    );
}
