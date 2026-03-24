import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { type ViewProps, View } from 'react-native';

export function ThemedView({ style, ...rest }: ViewProps) {
  const scheme = useColorScheme();
  return (
    <View
      style={[{ backgroundColor: Colors[scheme].background }, style]}
      {...rest}
    />
  );
}
