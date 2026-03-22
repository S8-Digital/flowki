import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HeadingSmall from '@/components/HeadingSmall';
import InputError from '@/components/InputError';
import InstallPromptBanner from '@/components/InstallPromptBanner';
import OfflineIndicator from '@/components/OfflineIndicator';

describe('InputError', () => {
    it('renders nothing when message is empty', () => {
        const { container } = render(<InputError />);
        expect(container.firstChild).toBeNull();
    });

    it('renders the error message when provided', () => {
        render(<InputError message="Email is required" />);
        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('applies a custom className to the wrapper', () => {
        const { container } = render(<InputError message="Error" className="mt-2" />);
        expect(container.firstChild).toHaveClass('mt-2');
    });
});

describe('HeadingSmall', () => {
    it('renders the title', () => {
        render(<HeadingSmall title="Profile information" />);
        expect(screen.getByRole('heading', { name: 'Profile information' })).toBeInTheDocument();
    });

    it('renders description when provided', () => {
        render(<HeadingSmall title="Settings" description="Manage your account" />);
        expect(screen.getByText('Manage your account')).toBeInTheDocument();
    });

    it('does not render description text when omitted', () => {
        render(<HeadingSmall title="Title only" />);
        expect(screen.queryByText('Title only')).toBeInTheDocument();
        // Only one element — the heading. No description node.
        const header = screen.getByRole('banner');
        expect(header.querySelectorAll('p')).toHaveLength(0);
    });
});

describe('OfflineIndicator', () => {
    const originalOnLine = Object.getOwnPropertyDescriptor(navigator, 'onLine');

    afterEach(() => {
        if (originalOnLine) {
            Object.defineProperty(navigator, 'onLine', originalOnLine);
        }
    });

    it('renders nothing when the browser is online', () => {
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
        const { container } = render(<OfflineIndicator />);
        expect(container.firstChild).toBeNull();
    });

    it('shows the offline banner when the browser is offline', () => {
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
        render(<OfflineIndicator />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/you're offline/i)).toBeInTheDocument();
    });

    it('shows the banner after an "offline" window event', () => {
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
        render(<OfflineIndicator />);
        expect(screen.queryByRole('alert')).toBeNull();

        act(() => {
            window.dispatchEvent(new Event('offline'));
        });
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('hides the banner after an "online" window event', () => {
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
        render(<OfflineIndicator />);
        expect(screen.getByRole('alert')).toBeInTheDocument();

        act(() => {
            window.dispatchEvent(new Event('online'));
        });
        expect(screen.queryByRole('alert')).toBeNull();
    });
});

describe('InstallPromptBanner', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders nothing when there is no install prompt available', () => {
        const { container } = render(<InstallPromptBanner />);
        expect(container.firstChild).toBeNull();
    });

    it('shows the install banner when beforeinstallprompt fires', () => {
        render(<InstallPromptBanner />);

        const mockPrompt = {
            prompt: vi.fn().mockResolvedValue(undefined),
            userChoice: Promise.resolve({ outcome: 'accepted' as const }),
            preventDefault: vi.fn(),
        };
        act(() => {
            const event = Object.assign(new Event('beforeinstallprompt'), mockPrompt);
            window.dispatchEvent(event);
        });

        expect(screen.getByText(/add flowki to your home screen/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument();
    });

    it('hides the banner when the user dismisses it', async () => {
        const user = userEvent.setup({ pointerEventsCheck: 0 });
        render(<InstallPromptBanner />);

        const mockPrompt = {
            prompt: vi.fn().mockResolvedValue(undefined),
            userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
            preventDefault: vi.fn(),
        };
        act(() => {
            const event = Object.assign(new Event('beforeinstallprompt'), mockPrompt);
            window.dispatchEvent(event);
        });

        const dismissButton = screen.getByRole('button', { name: /dismiss install prompt/i });
        await user.click(dismissButton);

        expect(screen.queryByText(/add flowki to your home screen/i)).toBeNull();
        expect(localStorage.getItem('pwa_install_dismissed')).toBe('true');
    });

    it('does not show the banner when it was previously dismissed', () => {
        localStorage.setItem('pwa_install_dismissed', 'true');
        render(<InstallPromptBanner />);

        const mockPrompt = {
            prompt: vi.fn().mockResolvedValue(undefined),
            userChoice: Promise.resolve({ outcome: 'accepted' as const }),
            preventDefault: vi.fn(),
        };
        act(() => {
            const event = Object.assign(new Event('beforeinstallprompt'), mockPrompt);
            window.dispatchEvent(event);
        });

        expect(screen.queryByText(/add flowki to your home screen/i)).toBeNull();
    });
});
