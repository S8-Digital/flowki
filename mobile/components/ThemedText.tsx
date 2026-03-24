import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Text, type TextProps } from 'react-native';

type Variant = 'default' | 'title' | 'subtitle' | 'caption' | 'muted';

const variantStyles: Record<Variant, object> = {
  default: { fontSize: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600' },
  caption: { fontSize: 12 },
  muted: { fontSize: 14 },
};

interface ThemedTextProps extends TextProps {
  variant?: Variant;
}

export function ThemedText({
  style,
  variant = 'default',
  ...rest
}: ThemedTextProps) {
  const scheme = useColorScheme();
  const color =
    variant === 'muted' ? Colors[scheme].muted : Colors[scheme].text;

  return (
    <Text style={[{ color }, variantStyles[variant], style]} {...rest} />
  );
}
