import { Head, Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarDays, CheckSquare, ChefHat, RotateCcw, ShoppingCart, Users } from 'lucide-react';
import AppearanceToggle from '@/components/AppearanceToggle';
import { login, register } from '@/routes';

const features = [
    { name: 'Todos', icon: CheckSquare },
    { name: 'Chores', icon: RotateCcw },
    { name: 'Calendar', icon: CalendarDays },
    { name: 'Shopping', icon: ShoppingCart },
    { name: 'Recipes', icon: ChefHat },
    { name: 'Family', icon: Users },
];

export default function Welcome() {
    return (
        <>
            <Head title="Family Organizer" />

            <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
                <Box
                    component="header"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider',
                        px: 3,
                        py: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.125rem', fontWeight: 700 }}>
                        <Users className="size-5 text-primary" />
                        Family Organizer
                    </Box>
                    <Box component="nav" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AppearanceToggle />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Link href={login()} className="text-sm text-muted-foreground transition hover:text-foreground">
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                Get Started
                            </Link>
                        </Box>
                    </Box>
                </Box>

                <Box
                    component="main"
                    sx={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        px: 3,
                        py: 10,
                        textAlign: 'center',
                    }}
                >
                    <Stack spacing={2}>
                        <Typography
                            variant="h3"
                            sx={{ fontWeight: 700, letterSpacing: '-0.025em', fontSize: { xs: '2.25rem', sm: '3rem', lg: '3.75rem' } }}
                        >
                            Organise your family,
                            <br className="hidden sm:block" />
                            together.
                        </Typography>
                        <Typography sx={{ mx: 'auto', maxWidth: 600, fontSize: '1.125rem', color: 'text.secondary' }}>
                            Shared todos, chores, calendar, shopping lists, and recipes — all in one place for the whole family.
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <Link
                            href={register()}
                            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                            Create your family
                        </Link>
                        <Link href={login()} className="rounded-md border px-6 py-2.5 text-sm font-semibold transition hover:bg-accent">
                            Sign in
                        </Link>
                    </Box>

                    <Box sx={{ mt: 4, display: 'grid', maxWidth: 840, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                        {features.map((feature) => (
                            <Box
                                key={feature.name}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 1,
                                    borderRadius: 2,
                                    border: 1,
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper',
                                    p: 2,
                                    fontSize: '0.875rem',
                                }}
                            >
                                <feature.icon className="size-6 text-primary" />
                                <Typography component="span" sx={{ fontWeight: 500 }}>
                                    {feature.name}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </>
    );
}
