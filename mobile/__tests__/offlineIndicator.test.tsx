/**
 * Tests for mobile/components/OfflineIndicator.tsx
 *
 * Covers:
 * - Renders nothing when online (isConnected=true)
 * - Shows "No internet connection" banner when isConnected=false
 * - Shows banner when isInternetReachable=false (even if isConnected=true)
 * - Calls NetInfo.addEventListener on mount
 * - Cleans up listener on unmount
 */

import { OfflineIndicator } from '@/components/OfflineIndicator';
import NetInfo from '@react-native-community/netinfo';
import type { NetInfoState } from '@react-native-community/netinfo';
import { render, screen, act } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('OfflineIndicator', () => {
    let capturedListener: ((state: Partial<NetInfoState>) => void) | null = null;
    const removeListener = vi.fn();

    beforeEach(() => {
        capturedListener = null;
        removeListener.mockClear();
        vi.mocked(NetInfo.addEventListener).mockImplementation((listener) => {
            capturedListener = listener as (state: Partial<NetInfoState>) => void;

            return removeListener;
        });
    });

    it('renders nothing when the device is online', () => {
        render(<OfflineIndicator />);
        act(() => {
            capturedListener?.({ isConnected: true, isInternetReachable: true });
        });
        expect(screen.queryByText(/no internet connection/i)).toBeNull();
    });

    it('shows the offline banner when isConnected is false', () => {
        render(<OfflineIndicator />);
        act(() => {
            capturedListener?.({ isConnected: false, isInternetReachable: null });
        });
        expect(screen.getByText(/no internet connection/i)).toBeInTheDocument();
    });

    it('shows the offline banner when isInternetReachable is false', () => {
        render(<OfflineIndicator />);
        act(() => {
            capturedListener?.({ isConnected: true, isInternetReachable: false });
        });
        expect(screen.getByText(/no internet connection/i)).toBeInTheDocument();
    });

    it('hides the banner again when connectivity is restored', () => {
        render(<OfflineIndicator />);
        act(() => {
            capturedListener?.({ isConnected: false, isInternetReachable: null });
        });
        expect(screen.getByText(/no internet connection/i)).toBeInTheDocument();

        act(() => {
            capturedListener?.({ isConnected: true, isInternetReachable: true });
        });
        expect(screen.queryByText(/no internet connection/i)).toBeNull();
    });

    it('calls NetInfo.addEventListener on mount', () => {
        render(<OfflineIndicator />);
        expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('calls the unsubscribe function on unmount', () => {
        const { unmount } = render(<OfflineIndicator />);
        unmount();
        expect(removeListener).toHaveBeenCalledOnce();
    });
});
