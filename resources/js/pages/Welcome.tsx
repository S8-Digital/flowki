import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiButton from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';
import { Bell, CalendarDays, CheckSquare, ChefHat, MessageSquare, RotateCcw, Shield, ShoppingCart, Smartphone, Zap } from 'lucide-react';
import AppearanceToggle from '@/components/AppearanceToggle';
import AppLogoIcon from '@/components/AppLogoIcon';
import { useRemoteConfig } from '@/hooks/useRemoteConfig';
import { login, privacy, register, terms } from '@/routes';

/** Map of icon names (stored in Remote Config) to Lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
    Bell,
    CalendarDays,
    CheckSquare,
    ChefHat,
    MessageSquare,
    RotateCcw,
    Shield,
    ShoppingCart,
    Smartphone,
    Zap,
};

interface FeatureItem {
    name: string;
    icon: string;
    description: string;
}

interface StepItem {
    step: string;
    title: string;
    body: string;
}

interface BenefitItem {
    icon: string;
    title: string;
    description: string;
}

const DEFAULT_FEATURES: FeatureItem[] = [
    { name: 'Shared Todos', icon: 'CheckSquare', description: 'Assign tasks to family members with due dates. Everyone stays accountable.' },
    { name: 'Chores Roster', icon: 'RotateCcw', description: 'Recurring chores with automatic rotation. No more arguments about whose turn it is.' },
    { name: 'Family Calendar', icon: 'CalendarDays', description: 'One shared calendar for everyone. Syncs with Google Calendar too.' },
    { name: 'Shopping Lists', icon: 'ShoppingCart', description: 'Real-time shared lists. Tick items off as you shop — everyone sees instantly.' },
    { name: 'Recipes', icon: 'ChefHat', description: 'Save family favourites and plan meals together. Ingredients go straight to shopping.' },
    { name: 'AI Assistant', icon: 'MessageSquare', description: "Ask your family assistant anything — schedules, reminders, or what's for dinner." },
];

const DEFAULT_STEPS: StepItem[] = [
    { step: '1', title: 'Create your family', body: 'Sign up in 30 seconds. Name your family group and set a colour scheme.' },
    { step: '2', title: 'Invite everyone', body: 'Send a magic-link invite. Family members join with one tap — no setup required.' },
    { step: '3', title: 'Organise together', body: 'Assign tasks, plan the week, shop smarter. Life gets calmer immediately.' },
];

const DEFAULT_BENEFITS: BenefitItem[] = [
    { icon: 'Zap', title: 'Instant sync', description: 'Changes appear for every family member in real time.' },
    { icon: 'Smartphone', title: 'Works everywhere', description: 'Install on your home screen. Works offline when signal drops.' },
    { icon: 'Bell', title: 'Smart notifications', description: 'Get reminded at the right time. No app required — push works on mobile browsers.' },
    { icon: 'Shield', title: 'Private & secure', description: 'Your family data is yours. No ads, no tracking, no selling your data.' },
];

export default function Welcome() {
    const { getString, getJson } = useRemoteConfig();

    // ── Remote Config values (fall back to hardcoded defaults) ────────────────
    const badgeText = getString('welcome_badge_text');
    const heroHeadline = getString('welcome_hero_headline');
    const heroHighlight = getString('welcome_hero_headline_highlight');
    const heroSubheadline = getString('welcome_hero_subheadline');
    const heroCTAPrimary = getString('welcome_hero_cta_primary');
    const heroCTASecondary = getString('welcome_hero_cta_secondary');
    const heroSocialProof = getString('welcome_hero_social_proof');

    const featuresEyebrow = getString('welcome_features_eyebrow');
    const featuresHeadline = getString('welcome_features_headline');
    const featuresSubheadline = getString('welcome_features_subheadline');
    const features = getJson<FeatureItem[]>('welcome_features_json', DEFAULT_FEATURES);

    const stepsEyebrow = getString('welcome_steps_eyebrow');
    const stepsHeadline = getString('welcome_steps_headline');
    const steps = getJson<StepItem[]>('welcome_steps_json', DEFAULT_STEPS);

    const benefitsEyebrow = getString('welcome_benefits_eyebrow');
    const benefitsHeadline = getString('welcome_benefits_headline');
    const benefits = getJson<BenefitItem[]>('welcome_benefits_json', DEFAULT_BENEFITS);

    const ctaHeadline = getString('welcome_cta_headline');
    const ctaSubheadline = getString('welcome_cta_subheadline');
    const ctaButton = getString('welcome_cta_button');
    const ctaSigninLink = getString('welcome_cta_signin_link');

    // Headline split: everything before the highlight word stays unstyled.
    // Use indexOf to handle the last occurrence in case the word appears multiple times.
    const highlightIndex = heroHighlight ? heroHeadline.lastIndexOf(heroHighlight) : -1;
    const headlinePrefix = highlightIndex >= 0 ? heroHeadline.substring(0, highlightIndex).trimEnd() : heroHeadline;

    return (
        <>
            <Head title="Flowki — Organise your family, together" />

            <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
                {/* ── Header ── */}
                <Box
                    component="header"
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: { xs: 2, sm: 4 },
                        py: 1.5,
                        bgcolor: 'background.default',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
                        <AppLogoIcon style={{ width: 32, height: 32 }} />
                        <Typography component="span" sx={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Flowki
                        </Typography>
                    </Box>
                    <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                        <AppearanceToggle />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MuiLink
                                component={Link}
                                href={login()}
                                sx={{
                                    fontSize: '0.875rem',
                                    color: 'text.secondary',
                                    textDecoration: 'none',
                                    '&:hover': { color: 'text.primary' },
                                    display: { xs: 'none', sm: 'inline' },
                                }}
                            >
                                Log in
                            </MuiLink>
                            <MuiButton
                                component={Link}
                                href={register()}
                                variant="contained"
                                size="small"
                                sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                            >
                                Get started free
                            </MuiButton>
                        </Box>
                    </Box>
                </Box>

                {/* ── Hero ── */}
                <Box
                    component="section"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        px: { xs: 2, sm: 4 },
                        pt: { xs: 10, sm: 16 },
                        pb: { xs: 10, sm: 14 },
                        gap: 4,
                        bgcolor: 'background.default',
                    }}
                >
                    <Chip
                        label={badgeText}
                        size="small"
                        sx={{ fontWeight: 500, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.8rem', height: 28 }}
                    />

                    <Stack spacing={2} sx={{ maxWidth: 760 }}>
                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: '-0.04em',
                                lineHeight: 1.1,
                                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.25rem' },
                            }}
                        >
                            {heroHighlight ? (
                                <>
                                    {headlinePrefix}{' '}
                                    <Box component="span" sx={{ color: 'primary.main' }}>
                                        {heroHighlight}
                                    </Box>
                                </>
                            ) : (
                                heroHeadline
                            )}
                        </Typography>
                        <Typography
                            sx={{
                                mx: 'auto',
                                maxWidth: 560,
                                fontSize: { xs: '1.0625rem', sm: '1.25rem' },
                                color: 'text.secondary',
                                lineHeight: 1.6,
                                whiteSpace: 'pre-line',
                            }}
                        >
                            {heroSubheadline}
                        </Typography>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', maxWidth: 360 }}>
                        <MuiButton
                            component={Link}
                            href={register()}
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1rem', py: 1.5 }}
                        >
                            {heroCTAPrimary}
                        </MuiButton>
                        <MuiButton
                            component={Link}
                            href={login()}
                            variant="outlined"
                            fullWidth
                            size="large"
                            color="inherit"
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '1rem', py: 1.5 }}
                        >
                            {heroCTASecondary}
                        </MuiButton>
                    </Stack>

                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {heroSocialProof}
                    </Typography>
                </Box>

                {/* ── Features ── */}
                <Box
                    component="section"
                    sx={{
                        px: { xs: 2, sm: 4, md: 6 },
                        py: { xs: 10, sm: 14 },
                        bgcolor: 'background.paper',
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={8} sx={{ maxWidth: 1024, mx: 'auto' }}>
                        <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                                {featuresEyebrow}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
                                {featuresHeadline}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', maxWidth: 520, mx: 'auto', fontSize: '1.0625rem' }}>
                                {featuresSubheadline}
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                gap: 3,
                            }}
                        >
                            {features.map((feature) => {
                                const Icon = ICON_MAP[feature.icon] ?? CheckSquare;

                                return (
                                    <Box
                                        key={feature.name}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 1.5,
                                            borderRadius: 3,
                                            border: 1,
                                            borderColor: 'divider',
                                            bgcolor: 'background.default',
                                            p: 3,
                                            transition: 'box-shadow 0.2s',
                                            '&:hover': { boxShadow: '0 4px 24px rgba(0,0,0,0.07)' },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'inline-flex',
                                                width: 44,
                                                height: 44,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 2,
                                                bgcolor: 'primary.main',
                                                color: 'primary.contrastText',
                                            }}
                                        >
                                            <Icon size={22} />
                                        </Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{feature.name}</Typography>
                                        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.6 }}>
                                            {feature.description}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Stack>
                </Box>

                {/* ── How it works ── */}
                <Box component="section" sx={{ px: { xs: 2, sm: 4, md: 6 }, py: { xs: 10, sm: 14 }, bgcolor: 'background.default' }}>
                    <Stack spacing={8} sx={{ maxWidth: 840, mx: 'auto' }}>
                        <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                                {stepsEyebrow}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
                                {stepsHeadline}
                            </Typography>
                        </Stack>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                            {steps.map((s, i) => (
                                <Stack
                                    key={s.step}
                                    spacing={2}
                                    sx={{ alignItems: { xs: 'flex-start', md: 'center' }, textAlign: { xs: 'left', md: 'center' } }}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            width: 48,
                                            height: 48,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            fontWeight: 800,
                                            fontSize: '1.25rem',
                                        }}
                                    >
                                        {s.step}
                                    </Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{s.title}</Typography>
                                    <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.6 }}>{s.body}</Typography>
                                    {i < steps.length - 1 && (
                                        <Divider sx={{ display: { xs: 'block', md: 'none' }, width: '100%', borderStyle: 'dashed', opacity: 0.4 }} />
                                    )}
                                </Stack>
                            ))}
                        </Box>
                    </Stack>
                </Box>

                {/* ── Benefits ── */}
                <Box
                    component="section"
                    sx={{
                        px: { xs: 2, sm: 4, md: 6 },
                        py: { xs: 10, sm: 14 },
                        bgcolor: 'background.paper',
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={8} sx={{ maxWidth: 1024, mx: 'auto' }}>
                        <Stack spacing={1.5} sx={{ textAlign: 'center' }}>
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em' }}>
                                {benefitsEyebrow}
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
                                {benefitsHeadline}
                            </Typography>
                        </Stack>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                            {benefits.map((b) => {
                                const Icon = ICON_MAP[b.icon] ?? Zap;

                                return (
                                    <Stack key={b.title} direction="row" spacing={2.5} alignItems="flex-start">
                                        <Box
                                            sx={{
                                                flexShrink: 0,
                                                display: 'inline-flex',
                                                width: 44,
                                                height: 44,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: 2,
                                                bgcolor: 'background.default',
                                                border: 1,
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Icon size={20} color="var(--mui-palette-primary-main)" />
                                        </Box>
                                        <Stack spacing={0.5}>
                                            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>{b.title}</Typography>
                                            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.6 }}>
                                                {b.description}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                );
                            })}
                        </Box>
                    </Stack>
                </Box>

                {/* ── Final CTA ── */}
                <Box
                    component="section"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        px: { xs: 2, sm: 4 },
                        py: { xs: 12, sm: 16 },
                        gap: 4,
                        bgcolor: 'background.default',
                    }}
                >
                    <Stack spacing={2} sx={{ maxWidth: 600 }}>
                        <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: '2rem', sm: '2.75rem' } }}>
                            {ctaHeadline}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '1.0625rem', lineHeight: 1.6 }}>{ctaSubheadline}</Typography>
                    </Stack>

                    <MuiButton
                        component={Link}
                        href={register()}
                        variant="contained"
                        size="large"
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '1.0625rem', px: 5, py: 1.75 }}
                    >
                        {ctaButton}
                    </MuiButton>

                    <MuiLink
                        component={Link}
                        href={login()}
                        sx={{ fontSize: '0.875rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                    >
                        {ctaSigninLink}
                    </MuiLink>
                </Box>

                {/* ── Footer ── */}
                <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 2, sm: 4 }, py: 4, bgcolor: 'background.paper' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AppLogoIcon style={{ width: 24, height: 24 }} />
                            <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                Flowki
                            </Typography>
                        </Box>

                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="center">
                            <MuiLink
                                component={Link}
                                href={privacy()}
                                sx={{ fontSize: '0.8125rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                            >
                                Privacy Policy
                            </MuiLink>
                            <MuiLink
                                component={Link}
                                href={terms()}
                                sx={{ fontSize: '0.8125rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                            >
                                Terms of Service
                            </MuiLink>
                            <MuiLink
                                component={Link}
                                href={login()}
                                sx={{ fontSize: '0.8125rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                            >
                                Sign in
                            </MuiLink>
                        </Stack>

                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                            © {new Date().getFullYear()} Flowki. All rights reserved.
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </>
    );
}
