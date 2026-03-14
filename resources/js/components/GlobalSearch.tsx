import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { show as recipeShow } from '@/actions/App/Http/Controllers/RecipeController';
import { index as todoIndex } from '@/actions/App/Http/Controllers/TodoController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface SearchResults {
    todos: Array<{ id: number; title: string }>;
    chores: Array<{ id: number; title: string }>;
    events: Array<{ id: number; title: string }>;
    recipes: Array<{ id: number; title: string }>;
    shopping_items: Array<{ id: number; name: string }>;
}

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        clearTimeout(debounceRef.current);

        if (query.length < 2) {
            setResults(null);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' },
                });
                setResults(await response.json());
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    function open() {
        setIsOpen(true);
    }

    function close() {
        setIsOpen(false);
        setQuery('');
        setResults(null);
    }

    const hasResults =
        results && results.todos.length + results.chores.length + results.events.length + results.recipes.length + results.shopping_items.length > 0;

    return (
        <div className="relative">
            <Button variant="ghost" size="icon" className="group h-9 w-9 cursor-pointer" onClick={open}>
                <Search className="size-5 opacity-80 group-hover:opacity-100" />
            </Button>

            {isOpen &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

                        <div className="relative z-10 w-full max-w-lg rounded-xl border bg-background shadow-2xl">
                            <div className="flex items-center gap-2 border-b px-4 py-3">
                                <Search className="size-4 shrink-0 text-muted-foreground" />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search todos, chores, events, recipes…"
                                    className="border-0 p-0 shadow-none focus-visible:ring-0"
                                    autoFocus
                                />
                                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={close}>
                                    <X className="size-4" />
                                </Button>
                            </div>

                            <div className="max-h-96 overflow-y-auto p-2">
                                {isLoading && <p className="py-4 text-center text-sm text-muted-foreground">Searching…</p>}

                                {!isLoading && query.length >= 2 && !hasResults && (
                                    <p className="py-4 text-center text-sm text-muted-foreground">No results for &ldquo;{query}&rdquo;</p>
                                )}

                                {results && (
                                    <>
                                        {results.todos.length > 0 && (
                                            <div>
                                                <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Todos
                                                </p>
                                                {results.todos.map((t) => (
                                                    <Link
                                                        key={t.id}
                                                        href={todoIndex().url}
                                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                        onClick={close}
                                                    >
                                                        {t.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {results.chores.length > 0 && (
                                            <div>
                                                <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Chores
                                                </p>
                                                {results.chores.map((c) => (
                                                    <Link
                                                        key={c.id}
                                                        href={choreIndex().url}
                                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                        onClick={close}
                                                    >
                                                        {c.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {results.events.length > 0 && (
                                            <div>
                                                <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Events
                                                </p>
                                                {results.events.map((e) => (
                                                    <Link
                                                        key={e.id}
                                                        href={calendarIndex().url}
                                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                        onClick={close}
                                                    >
                                                        {e.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {results.recipes.length > 0 && (
                                            <div>
                                                <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Recipes
                                                </p>
                                                {results.recipes.map((r) => (
                                                    <Link
                                                        key={r.id}
                                                        href={recipeShow(r.id).url}
                                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                                                        onClick={close}
                                                    >
                                                        {r.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {results.shopping_items.length > 0 && (
                                            <div>
                                                <p className="px-2 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                                    Shopping Items
                                                </p>
                                                {results.shopping_items.map((item) => (
                                                    <p
                                                        key={item.id}
                                                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground"
                                                    >
                                                        {item.name}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
