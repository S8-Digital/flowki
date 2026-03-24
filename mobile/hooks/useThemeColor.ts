import { Colors } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';

type ColorKey = keyof (typeof Colors)['light'];

/** Returns the theme colour for the given key based on the active color scheme. */
export function useThemeColor(colorKey: ColorKey): string {
  const scheme = useColorScheme();
  return Colors[scheme][colorKey];
}
