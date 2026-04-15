import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiButton from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';
import { Bell, CalendarDays, CheckSquare, ChefHat, MessageSquare, RotateCcw, Shield, ShoppingCart, Smartphone, Zap } from 'lucide-react';
import AppearanceToggle from '@/components/AppearanceToggle';
import AppLogoIcon from '@/components/AppLogoIcon';
import { useRemoteConfig } from '@/hooks/useRemoteConfig';
import { FooterBox, LogoLink, PageRoot } from '@/lib/publicStyled';
import { footerLinkSx, logoWordmarkSx, navLinkSx } from '@/lib/publicSx';
import type { PolymorphicProps } from '@/types/globals';
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

// ── Styled components (visual props not permitted in sx) ──────────────────────

const NavCTAButton = styled(MuiButton)<PolymorphicProps>({ whiteSpace: 'nowrap' });

const HeroBadge = styled(Chip)(({ theme }) => ({
    fontWeight: 500,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontSize: '0.8rem',
    height: 28,
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
    fontSize: '2.5rem',
    [theme.breakpoints.up('sm')]: { fontSize: '3.5rem' },
    [theme.breakpoints.up('md')]: { fontSize: '4.25rem' },
}));

const HeroSubheading = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    whiteSpace: 'pre-line',
    fontSize: '1.0625rem',
    [theme.breakpoints.up('sm')]: { fontSize: '1.25rem' },
}));

const HeroCTAButton = styled(MuiButton)<PolymorphicProps>({ fontSize: '1rem' });

const SectionHeading = styled(Typography)(({ theme }) => ({
    fontSize: '1.75rem',
    [theme.breakpoints.up('sm')]: { fontSize: '2.25rem' },
}));

const SectionSubheading = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '1.0625rem',
}));

const ItemTitle = styled(Typography)({ fontWeight: 700 });

const PaperSection = styled(Box)<PolymorphicProps>(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

const CenteredTextStack = styled(Stack)({ textAlign: 'center' });

const StepStack = styled(Stack)(({ theme }) => ({
    textAlign: 'left',
    [theme.breakpoints.up('md')]: { textAlign: 'center' },
}));

const StepTitle = styled(Typography)({ fontWeight: 700, fontSize: '1.0625rem' });

const DashedDivider = styled(Divider)({ opacity: 0.4, borderStyle: 'dashed' });

const CTAHeading = styled(Typography)(({ theme }) => ({
    fontSize: '2rem',
    [theme.breakpoints.up('sm')]: { fontSize: '2.75rem' },
}));

const CTAMainButton = styled(MuiButton)<PolymorphicProps>({ fontSize: '1.0625rem' });

const FooterBranding = styled(Typography)<PolymorphicProps>({ fontWeight: 700, fontSize: '0.9rem' });

const CenteredSection = styled(Box)<PolymorphicProps>(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    textAlign: 'center',
}));

// ─────────────────────────────────────────────────────────────────────────────

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

            <PageRoot sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
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
                    <LogoLink component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AppLogoIcon style={{ width: 32, height: 32 }} />
                        <Typography component="span" sx={logoWordmarkSx}>
                            Flowki
                        </Typography>
                    </LogoLink>
                    <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                        <AppearanceToggle />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MuiLink component={Link} href={login()} sx={{ ...navLinkSx, display: { xs: 'none', sm: 'inline' } }}>
                                Log in
                            </MuiLink>
                            <NavCTAButton component={Link} href={register().url} variant="contained" size="small">
                                Get started free
                            </NavCTAButton>
                        </Box>
                    </Box>
                </Box>

                {/* ── Hero ── */}
                <CenteredSection
                    component="section"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        px: { xs: 2, sm: 4 },
                        pt: { xs: 10, sm: 16 },
                        pb: { xs: 10, sm: 14 },
                        gap: 4,
                    }}
                >
                    <HeroBadge label={badgeText} size="small" />

                    <Stack alignItems="center" spacing={2} sx={{ maxWidth: 760 }}>
                        {/* fontWeight/letterSpacing/lineHeight inherited from h1 theme variant */}
                        <HeroTitle variant="h1">
                            {heroHighlight ? (
                                <>
                                    {headlinePrefix}{' '}
                                    <Box component="span" color="primary.main">
                                        {heroHighlight}
                                    </Box>
                                </>
                            ) : (
                                heroHeadline
                            )}
                        </HeroTitle>
                        {/* lineHeight inherited from body1 theme variant */}
                        <HeroSubheading sx={{ mx: 'auto', maxWidth: 560 }}>{heroSubheadline}</HeroSubheading>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: '100%', maxWidth: 360 }}>
                        {/* textTransform/fontWeight come from MuiButton theme override */}
                        <HeroCTAButton component={Link} href={register().url} variant="contained" fullWidth size="large" sx={{ py: 1.5 }}>
                            {heroCTAPrimary}
                        </HeroCTAButton>
                        <HeroCTAButton component={Link} href={login().url} variant="outlined" fullWidth size="large" color="inherit" sx={{ py: 1.5 }}>
                            {heroCTASecondary}
                        </HeroCTAButton>
                    </Stack>

                    <Typography variant="caption" color="text.secondary">
                        {heroSocialProof}
                    </Typography>
                </CenteredSection>
                <Box
                    component="section"
                    sx={{
                        px: { xs: 2, sm: 4, md: 6 },
                        py: { xs: 10, sm: 14 },
                        bgcolor: 'background.subtle',
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={8} sx={{ maxWidth: 1024, mx: 'auto' }}>
                        <Stack spacing={1.5} alignItems="center" textAlign="center">
                            {/* fontWeight/letterSpacing inherited from overline theme variant */}
                            <Typography variant="overline" color="primary.main">
                                {featuresEyebrow}
                            </Typography>
                            {/* fontWeight/letterSpacing inherited from h3 theme variant */}
                            <SectionHeading variant="h3">{featuresHeadline}</SectionHeading>
                            <SectionSubheading sx={{ maxWidth: 520, mx: 'auto' }}>{featuresSubheadline}</SectionSubheading>
                        </Stack>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
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
                                            '&:hover': { boxShadow: 2 },
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
                                        {/* fontSize matches body1; fontWeight overrides body1 default of 400 */}
                                        <ItemTitle variant="body1">{feature.name}</ItemTitle>
                                        {/* fontSize/lineHeight from body2 theme variant */}
                                        <Typography variant="body2" color="text.secondary">
                                            {feature.description}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Stack>
                </Box>

                {/* ── How it works ── */}
                <PaperSection component="section" sx={{ px: { xs: 2, sm: 4, md: 6 }, py: { xs: 10, sm: 14 } }}>
                    <Stack spacing={8} sx={{ maxWidth: 840, mx: 'auto' }}>
                        <CenteredTextStack spacing={1.5}>
                            <Typography variant="overline" color="primary.main">
                                {stepsEyebrow}
                            </Typography>
                            <SectionHeading variant="h3">{stepsHeadline}</SectionHeading>
                        </CenteredTextStack>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
                            {steps.map((s, i) => (
                                <StepStack key={s.step} spacing={2} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
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
                                            fontWeight: 'bold',
                                            fontSize: '1.25rem',
                                        }}
                                    >
                                        {s.step}
                                    </Box>
                                    <StepTitle>{s.title}</StepTitle>
                                    {/* fontSize/lineHeight from body2 theme variant */}
                                    <Typography variant="body2" color="text.secondary">
                                        {s.body}
                                    </Typography>
                                    {i < steps.length - 1 && <DashedDivider sx={{ display: { xs: 'block', md: 'none' }, width: '100%' }} />}
                                </StepStack>
                            ))}
                        </Box>
                    </Stack>
                </PaperSection>

                {/* ── Benefits ── */}
                <Box
                    component="section"
                    sx={{
                        px: { xs: 2, sm: 4, md: 6 },
                        py: { xs: 10, sm: 14 },
                        bgcolor: 'background.subtle',
                        borderTop: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={8} sx={{ maxWidth: 1024, mx: 'auto' }}>
                        <CenteredTextStack spacing={1.5}>
                            <Typography variant="overline" color="primary.main">
                                {benefitsEyebrow}
                            </Typography>
                            <SectionHeading variant="h3">{benefitsHeadline}</SectionHeading>
                        </CenteredTextStack>

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
                                            <Icon size={20} />
                                        </Box>
                                        <Stack spacing={0.5}>
                                            <ItemTitle variant="body1">{b.title}</ItemTitle>
                                            <Typography variant="body2" color="text.secondary">
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
                <CenteredSection
                    component="section"
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        px: { xs: 2, sm: 4 },
                        py: { xs: 12, sm: 16 },
                        gap: 4,
                    }}
                >
                    <Stack spacing={2} sx={{ maxWidth: 600 }}>
                        {/* fontWeight/letterSpacing inherited from h2 theme variant */}
                        <CTAHeading variant="h2">{ctaHeadline}</CTAHeading>
                        {/* lineHeight inherited from body1 theme variant */}
                        <SectionSubheading>{ctaSubheadline}</SectionSubheading>
                    </Stack>

                    <CTAMainButton component={Link} href={register().url} variant="contained" size="large" sx={{ px: 5, py: 1.75 }}>
                        {ctaButton}
                    </CTAMainButton>

                    <MuiLink component={Link} href={login()} sx={navLinkSx}>
                        {ctaSigninLink}
                    </MuiLink>
                </CenteredSection>
                <FooterBox component="footer" sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AppLogoIcon style={{ width: 24, height: 24 }} />
                            <FooterBranding component="span">Flowki</FooterBranding>
                        </Box>

                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="center">
                            <MuiLink component={Link} href={privacy()} sx={footerLinkSx}>
                                Privacy Policy
                            </MuiLink>
                            <MuiLink component={Link} href={terms()} sx={footerLinkSx}>
                                Terms of Service
                            </MuiLink>
                            <MuiLink component={Link} href={login()} sx={footerLinkSx}>
                                Sign in
                            </MuiLink>
                        </Stack>

                        <Typography variant="caption" color="text.secondary">
                            © {new Date().getFullYear()} Flowki. All rights reserved.
                        </Typography>
                    </Stack>
                </FooterBox>
            </PageRoot>
        </>
    );
}
