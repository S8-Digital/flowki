import * as icons from 'lucide-react';

interface IconProps {
    name: string;
    className?: string;
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
}

export default function Icon({ name, className, size = 16, strokeWidth = 2, color }: IconProps) {
    const iconName = name.charAt(0).toUpperCase() + name.slice(1);
    const IconComponent = (icons as Record<string, any>)[iconName];

    if (!IconComponent) {
        return null;
    }

    return <IconComponent className={className} size={size} strokeWidth={strokeWidth} color={color} />;
}
