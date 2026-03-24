import { useColorScheme as _useColorScheme } from 'react-native';

/** Returns 'light' or 'dark' based on the system preference. */
export function useColorScheme() {
  return _useColorScheme() ?? 'light';
}
