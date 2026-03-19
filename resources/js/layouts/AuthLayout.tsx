import type { PropsWithChildren } from 'react';
import AuthSimpleLayout from '@/layouts/auth/AuthSimpleLayout';

interface Props extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function AuthLayout({ children, title, description }: Props) {
    return (
        <AuthSimpleLayout title={title} description={description}>
            {children}
        </AuthSimpleLayout>
    );
}
