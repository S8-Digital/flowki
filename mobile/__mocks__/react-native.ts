/**
 * Lightweight react-native stub for the Vitest test environment.
 *
 * react-native/index.js contains `import typeof` Flow syntax that Node.js
 * cannot parse. This stub is wired into vitest.config.ts via resolve.alias so
 * Vite resolves `react-native` to this compiled TypeScript file instead of
 * the raw Flow-typed source, preventing the SyntaxError at collection time.
 */
import * as React from 'react';
import { vi } from 'vitest';

const View = (props: Record<string, unknown>) => React.createElement('div', props);
const Text = (props: Record<string, unknown>) => React.createElement('span', props);
const StyleSheet = { create: (s: unknown) => s, flatten: (s: unknown) => s };
const Dimensions = { get: () => ({ width: 375, height: 667 }) };
const Platform = { OS: 'ios', select: (m: Record<string, unknown>) => m.ios ?? m.default };
const Animated = {
    Value: class {
        constructor(v: number) {
            return v as unknown as object;
        }
    },
    View,
    Text,
    createAnimatedComponent: (c: unknown) => c,
    timing: () => ({ start: vi.fn() }),
    spring: () => ({ start: vi.fn() }),
};

export {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
};

export const TouchableOpacity = View;
export const TouchableHighlight = View;
export const TouchableWithoutFeedback = View;
export const Pressable = View;
export const ScrollView = View;
export const FlatList = View;
export const SectionList = View;
export const Image = View;
export const TextInput = View;
export const Switch = View;
export const Modal = View;
export const ActivityIndicator = View;
export const SafeAreaView = View;
export const KeyboardAvoidingView = View;
export const InteractionManager = { runAfterInteractions: (cb: () => void) => cb() };
export const Linking = { openURL: vi.fn(), addEventListener: vi.fn() };
export const Alert = { alert: vi.fn() };
export const Keyboard = {
    dismiss: vi.fn(),
    addListener: vi.fn(() => ({ remove: vi.fn() })),
};
export const useColorScheme = vi.fn(() => 'light');

export default {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
    TouchableOpacity: View,
    TouchableHighlight: View,
    TouchableWithoutFeedback: View,
    Pressable: View,
    ScrollView: View,
    FlatList: View,
    SectionList: View,
    Image: View,
    TextInput: View,
    Switch: View,
    Modal: View,
    ActivityIndicator: View,
    SafeAreaView: View,
    KeyboardAvoidingView: View,
    InteractionManager: { runAfterInteractions: (cb: () => void) => cb() },
    Linking: { openURL: vi.fn(), addEventListener: vi.fn() },
    Alert: { alert: vi.fn() },
    Keyboard: {
        dismiss: vi.fn(),
        addListener: vi.fn(() => ({ remove: vi.fn() })),
    },
    useColorScheme: vi.fn(() => 'light'),
};

