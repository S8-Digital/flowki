import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'pwa_install_dismissed';

export interface UseInstallPromptReturn {
    isInstallable: boolean;
    isDismissed: boolean;
    promptInstall: () => Promise<void>;
    dismiss: () => void;
}

export function useInstallPrompt(): UseInstallPromptReturn {
    const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isDismissed, setIsDismissed] = useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'true';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setPromptEvent(e as BeforeInstallPromptEvent);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const promptInstall = useCallback(async () => {
        if (!promptEvent) {
            return;
        }

        await promptEvent.prompt();
        await promptEvent.userChoice;

        // Clear the event regardless of outcome – the browser only allows one prompt per event
        setPromptEvent(null);
    }, [promptEvent]);

    const dismiss = useCallback(() => {
        setIsDismissed(true);

        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch {
            // localStorage may not be available in some environments
        }
    }, []);

    return {
        isInstallable: promptEvent !== null,
        isDismissed,
        promptInstall,
        dismiss,
    };
}
