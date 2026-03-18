import AppLogoIcon from '@/components/AppLogoIcon';
import { home } from '@/routes';
import type { AppPageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: Props) {
    const { name, quote } = usePage<AppPageProps>().props;

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'grid',
                height: '100dvh',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 4, sm: 0 },
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    display: { xs: 'none', lg: 'flex' },
                    height: '100%',
                    flexDirection: 'column',
                    backgroundColor: 'var(--muted)',
                    p: 5,
                    color: '#fff',
                    borderRight: '1px solid',
                    borderColor: 'var(--border)',
                }}
            >
                <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgb(24,24,27)' }} />
                <Box
                    component={Link}
                    href={home()}
                    sx={{
                        position: 'relative',
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '1.125rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                        color: '#fff',
                    }}
                >
                    <AppLogoIcon fill="currentColor" style={{ width: 32, height: 32, marginRight: 8 }} />
                    {name}
                </Box>
                {quote && (
                    <Box sx={{ position: 'relative', zIndex: 20, mt: 'auto' }}>
                        <Stack spacing={1} component="blockquote" sx={{ m: 0 }}>
                            <Typography sx={{ fontSize: '1.125rem' }}>&ldquo;{quote.message}&rdquo;</Typography>
                            <Typography component="footer" sx={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                                {quote.author}
                            </Typography>
                        </Stack>
                    </Box>
                )}
            </Box>
            <Box sx={{ p: { lg: 4 } }}>
                <Stack direction="column" justifyContent="center" spacing={3} sx={{ mx: 'auto', width: '100%', maxWidth: 350 }}>
                    <Stack direction="column" spacing={1} sx={{ textAlign: 'center' }}>
                        {title && (
                            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.025em' }}>
                                {title}
                            </Typography>
                        )}
                        {description && <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{description}</Typography>}
                    </Stack>
                    {children}
                </Stack>
            </Box>
        </Box>
    );
}
