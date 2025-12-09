import { View, Text } from 'react-native';
import { cn } from '../lib/utils';

interface BadgeProps {
    variant?: 'default' | 'outline' | 'destructive' | 'success' | 'warning';
    children: React.ReactNode;
    className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
    let bgClass = 'bg-gray-100';
    let textClass = 'text-gray-800';

    switch (variant) {
        case 'success':
            bgClass = 'bg-green-100';
            textClass = 'text-green-800';
            break;
        case 'warning':
            bgClass = 'bg-yellow-100';
            textClass = 'text-yellow-800';
            break;
        case 'destructive':
            bgClass = 'bg-red-100';
            textClass = 'text-red-800';
            break;
        case 'outline':
            bgClass = 'bg-transparent border border-gray-200';
            break;
    }

    return (
        <View className={cn("px-2.5 py-0.5 rounded-full items-center justify-center self-start", bgClass, className)}>
            <Text className={cn("text-xs font-semibold", textClass)}>{children}</Text>
        </View>
    );
}
