import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: (node) => {
            const cache = createCache({ key: 'css' });
            const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

            const html = ReactDOMServer.renderToString(
                <CacheProvider value={cache}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {node}
                    </ThemeProvider>
                </CacheProvider>,
            );

            const emotionChunks = extractCriticalToChunks(html);
            const emotionStyleTags = constructStyleTagsFromChunks(emotionChunks);

            return emotionStyleTags + html;
        },
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        setup: ({ App, props }) => (
            <Provider store={store}>
                <App {...props} />
            </Provider>
        ),
    }),
);
