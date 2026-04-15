import { Link, usePage } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { alpha, styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/AppLogoIcon';
import { home } from '@/routes';
import type { AppPageProps } from '@/types';

const SplitLeftPanel = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.common.white,
    borderRight: `1px solid ${theme.palette.divider}`,
}));

const DarkBackdrop = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.grey[900],
})) as typeof Box;

const PanelLogoLink = styled(Box)(({ theme }) => ({
    fontSize: '1.125rem',
    fontWeight: 500,
    textDecoration: 'none',
    color: theme.palette.common.white,
})) as typeof Box;

const QuoteText = styled(Typography)({
    fontSize: '1.125rem',
});

const QuoteAuthor = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: alpha(theme.palette.common.white, 0.7),
}));

const CenteredFormStack = styled(Stack)({
    textAlign: 'center',
});

const FormTitle = styled(Typography)({
    fontSize: '1.25rem',
    fontWeight: 500,
    letterSpacing: '-0.025em',
});

const FormDescription = styled(Typography)(({ theme }) => ({
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

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
            <SplitLeftPanel
                sx={{
                    position: 'relative',
                    display: { xs: 'none', lg: 'flex' },
                    height: '100%',
                    flexDirection: 'column',
                    p: 5,
                }}
            >
                <DarkBackdrop sx={{ position: 'absolute', inset: 0 }} />
                <PanelLogoLink
                    component={Link}
                    href={home()}
                    sx={{
                        position: 'relative',
                        zIndex: 20,
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <AppLogoIcon style={{ width: 32, height: 32, marginRight: 8 }} />
                    {name}
                </PanelLogoLink>
                {quote && (
                    <Box sx={{ position: 'relative', zIndex: 20, mt: 'auto' }}>
                        <Stack spacing={1} component="blockquote" sx={{ m: 0 }}>
                            <QuoteText>&ldquo;{quote.message}&rdquo;</QuoteText>
                            <QuoteAuthor component="footer">{quote.author}</QuoteAuthor>
                        </Stack>
                    </Box>
                )}
            </SplitLeftPanel>
            <Box sx={{ p: { lg: 4 } }}>
                <Stack direction="column" justifyContent="center" spacing={3} sx={{ mx: 'auto', width: '100%', maxWidth: 350 }}>
                    <CenteredFormStack direction="column" spacing={1}>
                        {title && <FormTitle variant="h6">{title}</FormTitle>}
                        {description && <FormDescription>{description}</FormDescription>}
                    </CenteredFormStack>
                    {children}
                </Stack>
            </Box>
        </Box>
    );
}
