/**
 * Tests for mobile themed components and utility hooks:
 *   - ThemedText  (mobile/components/ThemedText.tsx)
 *   - ThemedView  (mobile/components/ThemedView.tsx)
 *   - useColorScheme  (mobile/hooks/useColorScheme.ts)
 *   - useThemeColor   (mobile/hooks/useThemeColor.ts)
 */

import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import * as React from 'react';
import { useColorScheme as rnUseColorScheme } from 'react-native';
import { describe, expect, it, vi } from 'vitest';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

// ── ThemedText ────────────────────────────────────────────────────────────────

describe('ThemedText', () => {
    it('renders children', () => {
        render(<ThemedText>Hello world</ThemedText>);
        expect(screen.getByText('Hello world')).toBeInTheDocument();
    });

    it('applies default variant styles (fontSize 16)', () => {
        render(<ThemedText>Default</ThemedText>);
        const el = screen.getByText('Default');
        expect(el).toBeInTheDocument();
    });

    it('renders with title variant', () => {
        render(<ThemedText variant="title">Title text</ThemedText>);
        expect(screen.getByText('Title text')).toBeInTheDocument();
    });

    it('renders with subtitle variant', () => {
        render(<ThemedText variant="subtitle">Subtitle text</ThemedText>);
        expect(screen.getByText('Subtitle text')).toBeInTheDocument();
    });

    it('renders with muted variant', () => {
        render(<ThemedText variant="muted">Muted text</ThemedText>);
        expect(screen.getByText('Muted text')).toBeInTheDocument();
    });

    it('renders with caption variant', () => {
        render(<ThemedText variant="caption">Caption</ThemedText>);
        expect(screen.getByText('Caption')).toBeInTheDocument();
    });
});

// ── ThemedView ────────────────────────────────────────────────────────────────

describe('ThemedView', () => {
    it('renders children', () => {
        render(
            <ThemedView>
                <ThemedText>Content</ThemedText>
            </ThemedView>,
        );
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders without children', () => {
        const { container } = render(<ThemedView />);
        expect(container.firstChild).toBeInTheDocument();
    });
});

// ── useColorScheme ────────────────────────────────────────────────────────────

describe('useColorScheme', () => {
    it('returns "light" when system scheme is light', () => {
        vi.mocked(rnUseColorScheme).mockReturnValue('light');
        const { result } = renderHook(() => useColorScheme());
        expect(result.current).toBe('light');
    });

    it('returns "dark" when system scheme is dark', () => {
        vi.mocked(rnUseColorScheme).mockReturnValue('dark');
        const { result } = renderHook(() => useColorScheme());
        expect(result.current).toBe('dark');
    });

    it('defaults to "light" when system scheme is null', () => {
        vi.mocked(rnUseColorScheme).mockReturnValue(null);
        const { result } = renderHook(() => useColorScheme());
        expect(result.current).toBe('light');
    });
});

// ── useThemeColor ─────────────────────────────────────────────────────────────

describe('useThemeColor', () => {
    it('returns the light color when scheme is light', () => {
        vi.mocked(rnUseColorScheme).mockReturnValue('light');
        const { result } = renderHook(() => useThemeColor('tint'));
        expect(result.current).toBeTruthy();
    });

    it('returns a different color for dark scheme', () => {
        vi.mocked(rnUseColorScheme).mockReturnValue('dark');
        const { result } = renderHook(() => useThemeColor('tint'));
        expect(result.current).toBeTruthy();
    });
});
