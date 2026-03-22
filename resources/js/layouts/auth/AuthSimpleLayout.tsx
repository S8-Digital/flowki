import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/AppLogoIcon';
import { home } from '@/routes';

interface Props extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: Props) {
    return (
        <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{
                minHeight: '100svh',
                backgroundColor: 'var(--background)',
                p: { xs: 3, md: 5 },
                gap: 3,
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 384 }}>
                <Stack direction="column" sx={{ gap: 4 }}>
                    <Stack direction="column" alignItems="center" sx={{ gap: 2 }}>
                        <Box
                            component={Link}
                            href={home()}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                                fontWeight: 500,
                                textDecoration: 'none',
                                color: 'inherit',
                            }}
                        >
                            <Box
                                sx={{
                                    mb: 0.5,
                                    display: 'flex',
                                    width: 36,
                                    height: 36,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1.5,
                                }}
                            >
                                <AppLogoIcon style={{ width: 36, height: 36 }} />
                            </Box>
                            <Box
                                component="span"
                                sx={{
                                    position: 'absolute',
                                    width: 1,
                                    height: 1,
                                    overflow: 'hidden',
                                    clip: 'rect(0,0,0,0)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {title}
                            </Box>
                        </Box>
                        <Stack spacing={1} sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                                {title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                                {description}
                            </Typography>
                        </Stack>
                    </Stack>
                    {children}
                </Stack>
            </Box>
        </Stack>
    );
}
