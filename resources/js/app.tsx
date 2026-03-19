import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { initializeTheme } from './hooks/useAppearance';
import { getFirebaseAnalytics, trackEvent } from './lib/firebase-analytics';
import { initializePerformanceMonitoring } from './lib/firebase-performance';
import { store } from './store';
import theme from './theme';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <StrictMode>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Provider store={store}>
                        <App {...props} />
                    </Provider>
                </ThemeProvider>
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

// Track page views on every Inertia navigation
router.on('navigate', (event) => {
    trackEvent('page_view', {
        page_location: event.detail.page.url,
        page_title: document.title,
    });
});
