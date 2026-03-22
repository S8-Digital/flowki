import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/AppLogoIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { home } from '@/routes';

const AuthPageContainer = styled(Stack)(({ theme }) => ({
    backgroundColor: theme.palette.action.hover,
}));

const LogoLink = styled(Box)({
    fontWeight: 500,
    textDecoration: 'none',
    color: 'inherit',
}) as typeof Box;

interface Props extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function AuthCardLayout({ children, title, description }: Props) {
    return (
        <AuthPageContainer
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{
                minHeight: '100svh',
                p: { xs: 3, md: 5 },
                gap: 3,
            }}
        >
            <Stack direction="column" sx={{ width: '100%', maxWidth: 448, gap: 3 }}>
                <LogoLink
                    component={Link}
                    href={home()}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        alignSelf: 'center',
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
                        <AppLogoIcon style={{ width: 36, height: 36 }} />
                    </Box>
                </LogoLink>

                <Card style={{ borderRadius: '0.75rem' }}>
                    <CardHeader style={{ padding: '32px 40px 0', textAlign: 'center' }}>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent style={{ padding: '32px 40px' }}>{children}</CardContent>
                </Card>
            </Stack>
        </AuthPageContainer>
    );
}
