import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AppearanceToggle from '@/components/AppearanceToggle';
import AppLogoIcon from '@/components/AppLogoIcon';

const EFFECTIVE_DATE = '22 March 2025';
const CONTACT_EMAIL = 'privacy@flowki.app';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Stack spacing={1.5}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                {title}
            </Typography>
            {children}
        </Stack>
    );
}

function P({ children }: { children: React.ReactNode }) {
    return <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.75 }}>{children}</Typography>;
}

function Ul({ children }: { children: React.ReactNode }) {
    return (
        <Box component="ul" sx={{ m: 0, pl: 3, '& li': { mb: 0.5 } }}>
            {children}
        </Box>
    );
}

function Li({ children }: { children: React.ReactNode }) {
    return (
        <Typography component="li" sx={{ fontSize: '0.9375rem', color: 'text.secondary', lineHeight: 1.75 }}>
            {children}
        </Typography>
    );
}

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy — Flowki" />

            <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
                {/* Header */}
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
                    }}
                >
                    <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
                        <AppLogoIcon style={{ width: 32, height: 32 }} />
                        <Typography component="span" sx={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                            Flowki
                        </Typography>
                    </Box>
                    <AppearanceToggle />
                </Box>

                {/* Content */}
                <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 4 }, py: { xs: 6, sm: 10 } }}>
                    <Stack spacing={6} sx={{ maxWidth: 720, mx: 'auto' }}>
                        <Stack spacing={1}>
                            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                                Privacy Policy
                            </Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>Effective date: {EFFECTIVE_DATE}</Typography>
                        </Stack>

                        <P>
                            Flowki ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use,
                            disclose, and safeguard your information when you use the Flowki application and associated services. Please read this
                            policy carefully. If you disagree with its terms, please discontinue use of the application.
                        </P>

                        <Section title="1. Information We Collect">
                            <P>We collect information in the following ways:</P>
                            <Ul>
                                <Li>
                                    <strong>Account information:</strong> When you register, we collect your name, email address, and (optionally) a
                                    profile colour. If you sign in via Google or Apple, we receive your name and email from those providers.
                                </Li>
                                <Li>
                                    <strong>Family data:</strong> Content you create within the app — todos, chores, calendar events, shopping lists,
                                    recipes, and notes — is stored on our servers so it can be shared with your family group.
                                </Li>
                                <Li>
                                    <strong>Usage data:</strong> We collect anonymised analytics about how you interact with the app (pages visited,
                                    features used) to improve the product. We do not sell this data.
                                </Li>
                                <Li>
                                    <strong>Device & push tokens:</strong> If you grant notification permission, we store a push token to deliver
                                    real-time alerts to your device.
                                </Li>
                            </Ul>
                        </Section>

                        <Section title="2. How We Use Your Information">
                            <P>We use the information we collect to:</P>
                            <Ul>
                                <Li>Provide, operate, and maintain the Flowki service.</Li>
                                <Li>Sync your family's data across devices in real time.</Li>
                                <Li>Send you in-app notifications and push alerts you have opted into.</Li>
                                <Li>Respond to your support requests and questions.</Li>
                                <Li>Monitor and analyse usage trends to improve the app.</Li>
                                <Li>Comply with legal obligations.</Li>
                            </Ul>
                        </Section>

                        <Section title="3. Sharing Your Information">
                            <P>
                                We do not sell, trade, or rent your personal information to third parties. We may share information only in the
                                following limited circumstances:
                            </P>
                            <Ul>
                                <Li>
                                    <strong>Within your family group:</strong> Content you create is visible to other members of your family group as
                                    intended by the service.
                                </Li>
                                <Li>
                                    <strong>Service providers:</strong> We use trusted third-party services (e.g. cloud hosting, Firebase for push
                                    notifications, Google for optional calendar sync) that process data on our behalf under strict data processing
                                    agreements.
                                </Li>
                                <Li>
                                    <strong>Legal requirements:</strong> We may disclose your information if required by law or in response to valid
                                    legal process.
                                </Li>
                            </Ul>
                        </Section>

                        <Section title="4. Data Retention">
                            <P>
                                We retain your personal data for as long as your account remains active. If you delete your account, your data is
                                permanently removed from our systems within 30 days. Some anonymised, aggregated data may be retained for analytical
                                purposes.
                            </P>
                        </Section>

                        <Section title="5. Account Deletion">
                            <P>
                                You can permanently delete your Flowki account and all associated data at any time from{' '}
                                <strong>Settings → Profile → Delete account</strong> within the app. Deletion is immediate and irreversible — all your
                                data, family content, and account credentials will be permanently erased.
                            </P>
                        </Section>

                        <Section title="6. Cookies & Local Storage">
                            <P>
                                Flowki uses cookies and browser local storage to maintain your session and remember your appearance preferences
                                (light/dark mode). We do not use advertising or tracking cookies.
                            </P>
                        </Section>

                        <Section title="7. Children's Privacy">
                            <P>
                                Flowki is designed for family use and supports child accounts created and managed by a parent or guardian. We do not
                                knowingly collect personal information from children under 13 independently — child accounts can only be created by an
                                adult family administrator. If you believe a child has provided us personal information without parental consent,
                                please contact us immediately.
                            </P>
                        </Section>

                        <Section title="8. Security">
                            <P>
                                We implement industry-standard security measures including encrypted connections (HTTPS/TLS), hashed passwords, and
                                access controls to protect your data. No method of transmission over the internet is 100% secure; we strive to protect
                                your information but cannot guarantee absolute security.
                            </P>
                        </Section>

                        <Section title="9. Your Rights">
                            <P>Depending on your location, you may have rights including:</P>
                            <Ul>
                                <Li>Access to the personal data we hold about you.</Li>
                                <Li>Correction of inaccurate data.</Li>
                                <Li>Deletion of your account and data (see Section 5).</Li>
                                <Li>Portability of your data.</Li>
                                <Li>Objection to or restriction of processing.</Li>
                            </Ul>
                            <P>
                                To exercise these rights, contact us at <MuiLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</MuiLink>.
                            </P>
                        </Section>

                        <Section title="10. Changes to This Policy">
                            <P>
                                We may update this Privacy Policy from time to time. We will notify you of any significant changes by updating the
                                effective date above and, where appropriate, by sending a notification within the app.
                            </P>
                        </Section>

                        <Section title="11. Contact Us">
                            <P>
                                If you have any questions about this Privacy Policy, please contact us at{' '}
                                <MuiLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</MuiLink>.
                            </P>
                        </Section>
                    </Stack>
                </Box>

                {/* Footer */}
                <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 2, sm: 4 }, py: 3, bgcolor: 'background.paper' }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                        <MuiLink
                            component={Link}
                            href="/"
                            sx={{ fontSize: '0.8125rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                        >
                            Home
                        </MuiLink>
                        <MuiLink
                            component={Link}
                            href="/terms"
                            sx={{ fontSize: '0.8125rem', color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                        >
                            Terms of Service
                        </MuiLink>
                        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>© {new Date().getFullYear()} Flowki</Typography>
                    </Stack>
                </Box>
            </Box>
        </>
    );
}
