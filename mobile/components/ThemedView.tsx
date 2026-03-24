import {  View } from 'react-native';
import type {ViewProps} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function ThemedView({ style, ...rest }: ViewProps) {
  const scheme = useColorScheme();

  return (
    <View
      style={[{ backgroundColor: Colors[scheme].background }, style]}
      {...rest}
    />
  );
}
