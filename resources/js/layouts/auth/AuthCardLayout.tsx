import AppLogoIcon from '@/components/AppLogoIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { home } from '@/routes';
import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function AuthCardLayout({ children, title, description }: Props) {
    return (
        <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{
                minHeight: '100svh',
                backgroundColor: 'var(--muted)',
                p: { xs: 3, md: 5 },
                gap: 3,
            }}
        >
            <Stack direction="column" sx={{ width: '100%', maxWidth: 448, gap: 3 }}>
                <Box
                    component={Link}
                    href={home()}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        alignSelf: 'center',
                        fontWeight: 500,
                        textDecoration: 'none',
                        color: 'inherit',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            width: 36,
                            height: 36,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <AppLogoIcon fill="currentColor" style={{ width: 36, height: 36 }} />
                    </Box>
                </Box>

                <Card style={{ borderRadius: '0.75rem' }}>
                    <CardHeader style={{ padding: '32px 40px 0', textAlign: 'center' }}>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent style={{ padding: '32px 40px' }}>{children}</CardContent>
                </Card>
            </Stack>
        </Stack>
    );
}
