import type { AppPageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './AppLogoIcon';

export default function AppLogo() {
    const page = usePage<AppPageProps>();
    const displayName = page.props.auth.user?.family?.name ?? page.props.name;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">{displayName}</span>
            </div>
        </>
    );
}
