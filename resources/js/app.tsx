import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import ThemeWrapper from './components/ThemeWrapper';
import { initializeTheme } from './hooks/useAppearance';
import { getFirebaseAnalytics, trackEvent } from './lib/firebase-analytics';
import { initializePerformanceMonitoring } from './lib/firebase-performance';
import { store } from './store';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
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
    progress: {
        color: '#4e92be',
    },
});

// This will set light / dark mode on page load...
initializeTheme();

// Initialize Firebase services
getFirebaseAnalytics();
initializePerformanceMonitoring();

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
