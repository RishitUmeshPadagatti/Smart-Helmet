import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { cn } from '../lib/utils';

interface ButtonProps extends TouchableOpacityProps {
    variant?: 'default' | 'ghost' | 'outline' | 'destructive';
    size?: 'default' | 'sm' | 'icon';
    title?: string;
    className?: string;
    children?: React.ReactNode;
}

export function Button({ variant = 'default', size = 'default', title, children, className, ...props }: ButtonProps) {
    let baseClass = "flex-row items-center justify-center rounded-xl";
    let variantClass = "bg-black";
    let textClass = "text-white font-medium";

    switch (variant) {
        case 'ghost':
            variantClass = "bg-transparent";
            textClass = "text-black";
            break;
        case 'outline':
            variantClass = "bg-transparent border border-gray-200";
            textClass = "text-black";
            break;
        case 'destructive':
            variantClass = "bg-red-500";
            textClass = "text-white";
            break;
    }

    let sizeClass = "h-11 px-4 py-2";
    if (size === 'sm') sizeClass = "h-9 px-3";
    if (size === 'icon') sizeClass = "h-10 w-10 p-0";

    return (
        <TouchableOpacity
            className={cn(baseClass, variantClass, sizeClass, className)}
            activeOpacity={0.7}
            {...props}
        >
            {children || <Text className={textClass}>{title}</Text>}
        </TouchableOpacity>
    );
}
