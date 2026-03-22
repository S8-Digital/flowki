interface AppLogoIconProps {
    className?: string;
    style?: React.CSSProperties;
    alt?: string;
}

export default function AppLogoIcon({ className, style, alt = 'Flowki logo' }: AppLogoIconProps) {
    return <img src="/images/logo-icon.png" alt={alt} className={className} style={style} />;
}
