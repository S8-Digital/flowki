import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/AppLogoIcon';
import { home } from '@/routes';

const AuthPageContainer = styled(Stack)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
}));

const LogoLink = styled(Box)({
    fontWeight: 500,
    textDecoration: 'none',
    color: 'inherit',
}) as typeof Box;

const LogoIconWrapper = styled(Box)(({ theme }) => ({
    borderRadius: theme.spacing(1.5),
})) as typeof Box;

const SrOnlyText = styled(Box)({
    whiteSpace: 'nowrap',
}) as typeof Box;

const CenteredStack = styled(Stack)({
    textAlign: 'center',
});

const PageTitle = styled(Typography)({
    fontSize: '1.25rem',
    fontWeight: 500,
});

const PageDescription = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    textAlign: 'center',
}));

interface Props extends PropsWithChildren {
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: Props) {
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
            <Box sx={{ width: '100%', maxWidth: 384 }}>
                <Stack direction="column" sx={{ gap: 4 }}>
                    <Stack direction="column" alignItems="center" sx={{ gap: 2 }}>
                        <LogoLink
                            component={Link}
                            href={home()}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <LogoIconWrapper
                                sx={{
                                    mb: 0.5,
                                    display: 'flex',
                                    width: 100,
                                    height: 64,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AppLogoIcon style={{ width: 120, height: 120 }} />
                            </LogoIconWrapper>
                            <SrOnlyText
                                component="span"
                                sx={{
                                    position: 'absolute',
                                    width: 1,
                                    height: 1,
                                    overflow: 'hidden',
                                    clip: 'rect(0,0,0,0)',
                                }}
                            >
                                {title}
                            </SrOnlyText>
                        </LogoLink>
                        <CenteredStack spacing={1}>
                            <PageTitle variant="h6">{title}</PageTitle>
                            <PageDescription>{description}</PageDescription>
                        </CenteredStack>
                    </Stack>
                    {children}
                </Stack>
            </Box>
        </AuthPageContainer>
    );
}
