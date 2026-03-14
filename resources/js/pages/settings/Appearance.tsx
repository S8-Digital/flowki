import AppearanceTabs from '@/components/AppearanceTabs';
import HeadingSmall from '@/components/HeadingSmall';
import AppLayout from '@/layouts/AppLayout';
import SettingsLayout from '@/layouts/settings/Layout';
import { appearance } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbItems: BreadcrumbItem[] = [{ title: 'Appearance settings', href: appearance() }];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbItems}>
            <Head title="Appearance settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
