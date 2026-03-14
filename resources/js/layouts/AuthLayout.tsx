import AuthSimpleLayout from '@/layouts/auth/AuthSimpleLayout';
import type { PropsWithChildren } from 'react';

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
