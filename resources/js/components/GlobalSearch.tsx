import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { show as recipeShow } from '@/actions/App/Http/Controllers/RecipeController';
import { index as todoIndex } from '@/actions/App/Http/Controllers/TodoController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
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
    const debounceRef = useRef<number | undefined>(undefined);

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
        <Box sx={{ position: 'relative' }}>
            <Button variant="ghost" size="icon" style={{ width: 36, height: 36, cursor: 'pointer' }} onClick={open}>
                <Search style={{ width: 20, height: 20, opacity: 0.8 }} />
            </Button>

            {isOpen &&
                ReactDOM.createPortal(
                    <Box
                        sx={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 50,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            pt: '80px',
                        }}
                    >
                        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={close} />

                        <Box
                            sx={{
                                position: 'relative',
                                zIndex: 10,
                                width: '100%',
                                maxWidth: '32rem',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: 'var(--border)',
                                bgcolor: 'var(--background)',
                                boxShadow: 24,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    borderBottom: '1px solid',
                                    borderColor: 'var(--border)',
                                    px: 2,
                                    py: 1.5,
                                }}
                            >
                                <Search style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--muted-foreground)' }} />
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search todos, chores, events, recipes…"
                                    style={{ border: 0, padding: 0, boxShadow: 'none', flex: 1 }}
                                    autoFocus
                                />
                                <Button variant="ghost" size="icon" style={{ width: 24, height: 24, flexShrink: 0 }} onClick={close}>
                                    <X style={{ width: 16, height: 16 }} />
                                </Button>
                            </Box>

                            <Box sx={{ maxHeight: '24rem', overflowY: 'auto', p: 1 }}>
                                {isLoading && (
                                    <Box
                                        component="p"
                                        sx={{ py: 2, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)', m: 0 }}
                                    >
                                        Searching…
                                    </Box>
                                )}

                                {!isLoading && query.length >= 2 && !hasResults && (
                                    <Box
                                        component="p"
                                        sx={{ py: 2, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)', m: 0 }}
                                    >
                                        No results for &ldquo;{query}&rdquo;
                                    </Box>
                                )}

                                {results && (
                                    <>
                                        {results.todos.length > 0 && (
                                            <Box>
                                                <Box
                                                    component="p"
                                                    sx={{
                                                        px: 1,
                                                        pt: 1,
                                                        pb: 0.5,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                        color: 'var(--muted-foreground)',
                                                        textTransform: 'uppercase',
                                                        m: 0,
                                                    }}
                                                >
                                                    Todos
                                                </Box>
                                                {results.todos.map((t) => (
                                                    <Box
                                                        key={t.id}
                                                        component={Link as React.ElementType}
                                                        href={todoIndex().url}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            borderRadius: 1.5,
                                                            px: 1,
                                                            py: '6px',
                                                            fontSize: '0.875rem',
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            '&:hover': { bgcolor: 'var(--accent)' },
                                                        }}
                                                        onClick={close}
                                                    >
                                                        {t.title}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {results.chores.length > 0 && (
                                            <Box>
                                                <Box
                                                    component="p"
                                                    sx={{
                                                        px: 1,
                                                        pt: 1,
                                                        pb: 0.5,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                        color: 'var(--muted-foreground)',
                                                        textTransform: 'uppercase',
                                                        m: 0,
                                                    }}
                                                >
                                                    Chores
                                                </Box>
                                                {results.chores.map((c) => (
                                                    <Box
                                                        key={c.id}
                                                        component={Link as React.ElementType}
                                                        href={choreIndex().url}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            borderRadius: 1.5,
                                                            px: 1,
                                                            py: '6px',
                                                            fontSize: '0.875rem',
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            '&:hover': { bgcolor: 'var(--accent)' },
                                                        }}
                                                        onClick={close}
                                                    >
                                                        {c.title}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {results.events.length > 0 && (
                                            <Box>
                                                <Box
                                                    component="p"
                                                    sx={{
                                                        px: 1,
                                                        pt: 1,
                                                        pb: 0.5,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                        color: 'var(--muted-foreground)',
                                                        textTransform: 'uppercase',
                                                        m: 0,
                                                    }}
                                                >
                                                    Events
                                                </Box>
                                                {results.events.map((e) => (
                                                    <Box
                                                        key={e.id}
                                                        component={Link as React.ElementType}
                                                        href={calendarIndex().url}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            borderRadius: 1.5,
                                                            px: 1,
                                                            py: '6px',
                                                            fontSize: '0.875rem',
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            '&:hover': { bgcolor: 'var(--accent)' },
                                                        }}
                                                        onClick={close}
                                                    >
                                                        {e.title}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {results.recipes.length > 0 && (
                                            <Box>
                                                <Box
                                                    component="p"
                                                    sx={{
                                                        px: 1,
                                                        pt: 1,
                                                        pb: 0.5,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                        color: 'var(--muted-foreground)',
                                                        textTransform: 'uppercase',
                                                        m: 0,
                                                    }}
                                                >
                                                    Recipes
                                                </Box>
                                                {results.recipes.map((r) => (
                                                    <Box
                                                        key={r.id}
                                                        component={Link as React.ElementType}
                                                        href={recipeShow(r.id).url}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            borderRadius: 1.5,
                                                            px: 1,
                                                            py: '6px',
                                                            fontSize: '0.875rem',
                                                            textDecoration: 'none',
                                                            color: 'inherit',
                                                            '&:hover': { bgcolor: 'var(--accent)' },
                                                        }}
                                                        onClick={close}
                                                    >
                                                        {r.title}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}

                                        {results.shopping_items.length > 0 && (
                                            <Box>
                                                <Box
                                                    component="p"
                                                    sx={{
                                                        px: 1,
                                                        pt: 1,
                                                        pb: 0.5,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        letterSpacing: '0.05em',
                                                        color: 'var(--muted-foreground)',
                                                        textTransform: 'uppercase',
                                                        m: 0,
                                                    }}
                                                >
                                                    Shopping Items
                                                </Box>
                                                {results.shopping_items.map((item) => (
                                                    <Box
                                                        key={item.id}
                                                        component="p"
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            borderRadius: 1.5,
                                                            px: 1,
                                                            py: '6px',
                                                            fontSize: '0.875rem',
                                                            color: 'var(--muted-foreground)',
                                                            m: 0,
                                                        }}
                                                    >
                                                        {item.name}
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Box>,
                    document.body,
                )}
        </Box>
    );
}
