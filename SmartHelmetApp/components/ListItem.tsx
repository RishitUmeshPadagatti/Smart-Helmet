import { TouchableOpacity, Text, View } from 'react-native';
import { LucideIcon, ChevronRight } from 'lucide-react-native';
import { cn } from '../lib/utils';

interface ListItemProps {
    icon?: LucideIcon;
    label: string;
    value?: string | number;
    onPress?: () => void;
    className?: string;
    showArrow?: boolean;
}

export function ListItem({ icon: Icon, label, value, onPress, className, showArrow = true }: ListItemProps) {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className={cn("flex-row items-center justify-between p-4 bg-white border border-gray-100 rounded-xl mb-2", className)}
            disabled={!onPress}
        >
            <View className="flex-row items-center gap-3">
                {Icon && <Icon size={20} color="#666" />}
                <Text className="text-base font-medium text-gray-800">{label}</Text>
            </View>
            <View className="flex-row items-center gap-2">
                {value && <Text className="text-gray-500">{value}</Text>}
                {showArrow && onPress && <ChevronRight size={16} color="#999" />}
            </View>
        </TouchableOpacity>
    );
}
