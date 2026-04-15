import { Head } from '@inertiajs/react';
import Stack from '@mui/material/Stack';
import AppearanceTabs from '@/components/AppearanceTabs';
import HeadingSmall from '@/components/HeadingSmall';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import { appearance } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Appearance settings', href: appearance() }];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Appearance settings" />
            <SettingsLayout>
                <Stack spacing={3}>
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </Stack>
            </SettingsLayout>
        </AppLayout>
    );
}
