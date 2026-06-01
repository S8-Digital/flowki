import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import ThemeWrapper from './components/ThemeWrapper';
import { initializeTheme } from './hooks/useAppearance';
import { initFirebaseApp } from './lib/firebase';
import { getFirebaseAnalytics, trackEvent } from './lib/firebase-analytics';
import { initializePerformanceMonitoring } from './lib/firebase-performance';
import { initializeRemoteConfig } from './lib/firebase-remote-config';
import { store } from './store';
import type { AppPageProps } from './types';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        // Initialize Firebase using the config shared from the PHP backend at
        // request time, so runtime environment variables are used correctly
        // regardless of build-time env var availability (e.g. Cloud Run).
        const sharedProps = props.initialPage.props as AppPageProps;

        if (sharedProps.firebaseConfig?.projectId) {
            initFirebaseApp(sharedProps.firebaseConfig);
            getFirebaseAnalytics();
            initializePerformanceMonitoring();
            initializeRemoteConfig();
        }

        const root = createRoot(el);
        root.render(
            <StrictMode>
                <ThemeWrapper>
                    <Provider store={store}>
                        <App {...props} />
                    </Provider>
                </ThemeWrapper>
            </StrictMode>,
        );
    },
    progress: { delay: 250 },
});

// This will set light / dark mode on page load...
initializeTheme();

// Register PWA service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            if (import.meta.env.DEV) {
                console.warn('[PWA] Service worker registration failed:', err);
            }
        });
    });
}

// Track page views on every Inertia navigation
router.on('navigate', (event) => {
    trackEvent('page_view', {
        page_location: event.detail.page.url,
        page_title: document.title,
    });
});
