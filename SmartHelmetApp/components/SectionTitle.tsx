import { Text } from 'react-native';
import { cn } from '../lib/utils';

interface SectionTitleProps {
    title: string;
    className?: string;
}

export function SectionTitle({ title, className }: SectionTitleProps) {
    return (
        <Text className={cn("text-lg font-bold text-gray-900 mb-3", className)}>
            {title}
        </Text>
    );
}
