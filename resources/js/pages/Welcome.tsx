import AppearanceToggle from '@/components/AppearanceToggle';
import { login, register } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, CheckSquare, ChefHat, RotateCcw, ShoppingCart, Users } from 'lucide-react';

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

            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2 text-lg font-bold">
                        <Users className="size-5 text-primary" />
                        Family Organizer
                    </div>
                    <nav className="flex items-center gap-4">
                        <AppearanceToggle />
                        <div className="flex items-center gap-3">
                            <Link href={login()} className="text-sm text-muted-foreground transition hover:text-foreground">
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                            >
                                Get Started
                            </Link>
                        </div>
                    </nav>
                </header>

                <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Organise your family,
                            <br className="hidden sm:block" />
                            together.
                        </h1>
                        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                            Shared todos, chores, calendar, shopping lists, and recipes — all in one place for the whole family.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href={register()}
                            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                            Create your family
                        </Link>
                        <Link href={login()} className="rounded-md border px-6 py-2.5 text-sm font-semibold transition hover:bg-accent">
                            Sign in
                        </Link>
                    </div>

                    <div className="mt-8 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-sm">
                                <feature.icon className="size-6 text-primary" />
                                <span className="font-medium">{feature.name}</span>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
