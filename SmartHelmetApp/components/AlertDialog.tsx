import React from 'react';
import { View, Modal, TouchableOpacity, Pressable, StyleSheet, Platform } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';

interface AlertDialogProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
}

export function AlertDialog({ visible, onClose, title, message, confirmText = "Close", onConfirm }: AlertDialogProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable 
                className="flex-1 bg-black/60 items-center justify-center p-4" 
                onPress={onClose}
            >
                <Pressable 
                    className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
                    onPress={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                    <View className="px-6 pt-6 pb-2">
                        <Text className="text-xl font-bold">{title}</Text>
                    </View>

                    {/* Content */}
                    <View className="px-6 pb-6">
                        <Text variant="muted" className="text-base leading-6 mb-8">
                            {message}
                        </Text>
                        
                        <Button 
                            title={confirmText} 
                            onPress={onConfirm || onClose} 
                            className="w-full h-12 rounded-2xl"
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
