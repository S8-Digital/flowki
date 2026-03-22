import type { AppPageProps } from '@/types/index';

// Extend ImportMeta interface for Vite...
declare module 'vite/client' {
    interface ImportMetaEnv {
        readonly VITE_APP_NAME: string;
        readonly VITE_GOOGLE_MAPS_API_KEY: string | undefined;
        [key: string]: string | boolean | undefined;
    }

    interface ImportMeta {
        readonly env: ImportMetaEnv;
        readonly glob: <T>(pattern: string) => Record<string, () => Promise<T>>;
    }
}

declare module '@inertiajs/core' {
    interface InertiaConfig {
        sharedPageProps: AppPageProps;
    }
}

declare module '@mui/material/styles' {
    interface TypeBackground {
        subtle: string;
    }
}
