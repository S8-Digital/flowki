import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AppearanceToggle from '@/components/AppearanceToggle';
import AppLogoIcon from '@/components/AppLogoIcon';
import { Li, P, Section, Ul } from '@/components/PublicLegal';
import { FooterBox, LogoLink, PageRoot } from '@/lib/publicStyled';
import { footerLinkSx, logoWordmarkSx } from '@/lib/publicSx';
import { privacy } from '@/routes';

const EFFECTIVE_DATE = '22 March 2025';
const CONTACT_EMAIL = 'legal@flowki.app';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service — Flowki" />

            <PageRoot sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
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
                    <LogoLink component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AppLogoIcon style={{ width: 32, height: 32 }} />
                        <Typography component="span" sx={logoWordmarkSx}>
                            Flowki
                        </Typography>
                    </LogoLink>
                    <AppearanceToggle />
                </Box>

                {/* Content */}
                <Box component="main" sx={{ flex: 1, px: { xs: 2, sm: 4 }, py: { xs: 6, sm: 10 } }}>
                    <Stack spacing={6} sx={{ maxWidth: 720, mx: 'auto' }}>
                        <Stack spacing={1}>
                            {/* fontWeight/letterSpacing inherited from h4 theme variant */}
                            <Typography variant="h4">Terms of Service</Typography>
                            {/* fontSize/lineHeight from body2 theme variant */}
                            <Typography variant="body2" color="text.secondary">
                                Effective date: {EFFECTIVE_DATE}
                            </Typography>
                        </Stack>

                        <P>
                            Welcome to Flowki. By accessing or using the Flowki application and services (collectively, the "Service"), you agree to
                            be bound by these Terms of Service ("Terms"). Please read them carefully. If you do not agree to these Terms, you may not
                            use the Service.
                        </P>

                        <Section title="1. Acceptance of Terms">
                            <P>
                                By creating an account or otherwise accessing the Service, you confirm that you are at least 13 years old (or that a
                                parent or guardian has accepted these Terms on your behalf) and that you have the legal authority to enter into this
                                agreement.
                            </P>
                        </Section>

                        <Section title="2. Description of Service">
                            <P>
                                Flowki is a family organisation platform that provides shared task management, chore tracking, calendar, shopping
                                lists, recipe management, and an AI-powered assistant. Features may change over time and we reserve the right to
                                modify, suspend, or discontinue any part of the Service with reasonable notice.
                            </P>
                        </Section>

                        <Section title="3. Your Account">
                            <Ul>
                                <Li>You are responsible for maintaining the confidentiality of your account credentials.</Li>
                                <Li>You are responsible for all activity that occurs under your account.</Li>
                                <Li>You must provide accurate information when creating your account and keep it up to date.</Li>
                                <Li>You must notify us immediately of any unauthorised use of your account.</Li>
                                <Li>One person may not maintain more than one account unless expressly permitted.</Li>
                            </Ul>
                        </Section>

                        <Section title="4. Acceptable Use">
                            <P>You agree not to use the Service to:</P>
                            <Ul>
                                <Li>Violate any applicable laws or regulations.</Li>
                                <Li>Harass, abuse, or harm another person.</Li>
                                <Li>Upload or share content that is illegal, defamatory, obscene, or infringes third-party rights.</Li>
                                <Li>Attempt to gain unauthorised access to any part of the Service or its infrastructure.</Li>
                                <Li>Use automated means to access or scrape the Service without our written permission.</Li>
                                <Li>Impersonate any person or entity.</Li>
                            </Ul>
                            <P>We reserve the right to suspend or terminate accounts that violate these terms at our sole discretion.</P>
                        </Section>

                        <Section title="5. Your Content">
                            <P>
                                You retain ownership of all content you create within Flowki ("User Content"). By uploading or creating content, you
                                grant Flowki a limited, non-exclusive, royalty-free licence to store, display, and transmit your content solely for
                                the purpose of providing the Service to you and your family group.
                            </P>
                            <P>You are solely responsible for your User Content. We do not monitor or endorse content created by users.</P>
                        </Section>

                        <Section title="6. Privacy">
                            <P>
                                Your use of the Service is also governed by our{' '}
                                <MuiLink component={Link} href={privacy()}>
                                    Privacy Policy
                                </MuiLink>
                                , which is incorporated into these Terms by reference.
                            </P>
                        </Section>

                        <Section title="7. Third-Party Services">
                            <P>
                                The Service may integrate with third-party services such as Google Calendar and Firebase. Your use of those services
                                is subject to their own terms and privacy policies. We are not responsible for the practices of third-party services.
                            </P>
                        </Section>

                        <Section title="8. Account Termination & Deletion">
                            <P>
                                You may delete your account at any time from <strong>Settings → Profile → Delete account</strong>. Upon deletion, your
                                personal data and all associated content will be permanently removed within 30 days.
                            </P>
                            <P>
                                We may suspend or terminate your account if you breach these Terms. We will endeavour to provide reasonable notice
                                before termination unless the breach is severe or ongoing.
                            </P>
                        </Section>

                        <Section title="9. Disclaimer of Warranties">
                            <P>
                                The Service is provided "as is" and "as available" without warranties of any kind, express or implied, including but
                                not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant
                                that the Service will be uninterrupted, error-free, or free of viruses or harmful components.
                            </P>
                        </Section>

                        <Section title="10. Limitation of Liability">
                            <P>
                                To the maximum extent permitted by law, Flowki shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages arising out of or related to your use of the Service. Our total liability to you
                                for any claim shall not exceed the amount you have paid us in the twelve months preceding the claim, or $10 AUD if you
                                have not made any payments.
                            </P>
                        </Section>

                        <Section title="11. Governing Law">
                            <P>
                                These Terms are governed by the laws of New South Wales, Australia, without regard to its conflict of law provisions.
                                Any disputes shall be subject to the exclusive jurisdiction of the courts of New South Wales.
                            </P>
                        </Section>

                        <Section title="12. Changes to Terms">
                            <P>
                                We may update these Terms from time to time. If we make material changes, we will notify you by updating the effective
                                date and, where appropriate, by notifying you within the app. Your continued use of the Service after changes take
                                effect constitutes your acceptance of the revised Terms.
                            </P>
                        </Section>

                        <Section title="13. Contact">
                            <P>
                                If you have questions about these Terms, please contact us at{' '}
                                <MuiLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</MuiLink>.
                            </P>
                        </Section>
                    </Stack>
                </Box>

                {/* Footer */}
                <FooterBox component="footer" sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" flexWrap="wrap">
                        <MuiLink component={Link} href="/" sx={footerLinkSx}>
                            Home
                        </MuiLink>
                        <MuiLink component={Link} href={privacy()} sx={footerLinkSx}>
                            Privacy Policy
                        </MuiLink>
                        <Typography variant="caption" color="text.secondary">
                            © {new Date().getFullYear()} Flowki
                        </Typography>
                    </Stack>
                </FooterBox>
            </PageRoot>
        </>
    );
}
