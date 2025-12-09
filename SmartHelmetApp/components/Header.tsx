import { View, Text } from 'react-native';
import { cn } from '../lib/utils';

interface HeaderProps {
    title: string;
    rightContent?: React.ReactNode;
    className?: string;
}

export function Header({ title, rightContent, className }: HeaderProps) {
    return (
        <View className={cn("px-4 py-3 flex-row justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200/50", className)}>
            <Text className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-black">{title}</Text>
            {rightContent}
        </View>
    );
}
