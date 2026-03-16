import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { initializeTheme } from './hooks/useAppearance';
import { store } from './store';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <StrictMode>
                <Provider store={store}>
                    <App {...props} />
                </Provider>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4e92be',
    },
});

// This will set light / dark mode on page load...
initializeTheme();
