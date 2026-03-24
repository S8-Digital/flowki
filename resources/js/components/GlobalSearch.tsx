import { Link } from '@inertiajs/react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { index as calendarIndex } from '@/actions/App/Http/Controllers/CalendarEventController';
import { index as choreIndex } from '@/actions/App/Http/Controllers/ChoreController';
import { show as recipeShow } from '@/actions/App/Http/Controllers/RecipeController';
import { index as todoIndex } from '@/actions/App/Http/Controllers/TodoController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PolymorphicProps } from '@/types/globals';

interface SearchResults {
    todos: Array<{ id: number; title: string }>;
    chores: Array<{ id: number; title: string }>;
    events: Array<{ id: number; title: string }>;
    recipes: Array<{ id: number; title: string }>;
    shopping_items: Array<{ id: number; name: string }>;
}

const SearchOverlay = styled(Box)({
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
    zIndex: 10,
});

const SearchPanel = styled(Box)(({ theme }) => ({
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '32rem',
    borderRadius: 12,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[24],
}));

const SearchInputWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
}));

const SearchEmptyState = styled('p')(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    margin: 0,
}));

const SearchSectionHeader = styled('p')(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    margin: 0,
}));

const SearchResultItem = styled(Box, { shouldForwardProp: (prop) => prop !== 'muted' })<PolymorphicProps & { muted?: boolean }>(
    ({ theme, muted }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        borderRadius: 6,
        fontSize: '0.875rem',
        textDecoration: 'none',
        color: muted ? theme.palette.text.secondary : 'inherit',
        ...(!muted && { '&:hover': { backgroundColor: theme.palette.action.hover } }),
        margin: 0,
    }),
);

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
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            pt: '80px',
                        }}
                    >
                        <SearchOverlay onClick={close} />

                        <SearchPanel>
                            <SearchInputWrapper>
                                <Search style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--muted-foreground)' }} />
                                <Input
                                    label="Search"
                                    placeholder="Search todos, chores, events, recipes…"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    autoFocus
                                />
                                <Button variant="ghost" size="icon" style={{ width: 24, height: 24, flexShrink: 0 }} onClick={close}>
                                    <X style={{ width: 16, height: 16 }} />
                                </Button>
                            </SearchInputWrapper>

                            <Box sx={{ maxHeight: '24rem', overflowY: 'auto', p: 1 }}>
                                {isLoading && <SearchEmptyState sx={{ py: 2 }}>Searching…</SearchEmptyState>}

                                {!isLoading && query.length >= 2 && !hasResults && (
                                    <SearchEmptyState sx={{ py: 2 }}>No results for &ldquo;{query}&rdquo;</SearchEmptyState>
                                )}

                                {results && (
                                    <>
                                        {results.todos.length > 0 && (
                                            <Box>
                                                <SearchSectionHeader sx={{ px: 1, pt: 1, pb: 0.5 }}>Todos</SearchSectionHeader>
                                                {results.todos.map((t) => (
                                                    <SearchResultItem
                                                        key={t.id}
                                                        component={Link as React.ElementType}
                                                        href={todoIndex().url}
                                                        sx={{ px: 1, py: '6px' }}
                                                        onClick={close}
                                                    >
                                                        {t.title}
                                                    </SearchResultItem>
                                                ))}
                                            </Box>
                                        )}

                                        {results.chores.length > 0 && (
                                            <Box>
                                                <SearchSectionHeader sx={{ px: 1, pt: 1, pb: 0.5 }}>Chores</SearchSectionHeader>
                                                {results.chores.map((c) => (
                                                    <SearchResultItem
                                                        key={c.id}
                                                        component={Link as React.ElementType}
                                                        href={choreIndex().url}
                                                        sx={{ px: 1, py: '6px' }}
                                                        onClick={close}
                                                    >
                                                        {c.title}
                                                    </SearchResultItem>
                                                ))}
                                            </Box>
                                        )}

                                        {results.events.length > 0 && (
                                            <Box>
                                                <SearchSectionHeader sx={{ px: 1, pt: 1, pb: 0.5 }}>Events</SearchSectionHeader>
                                                {results.events.map((e) => (
                                                    <SearchResultItem
                                                        key={e.id}
                                                        component={Link as React.ElementType}
                                                        href={calendarIndex().url}
                                                        sx={{ px: 1, py: '6px' }}
                                                        onClick={close}
                                                    >
                                                        {e.title}
                                                    </SearchResultItem>
                                                ))}
                                            </Box>
                                        )}

                                        {results.recipes.length > 0 && (
                                            <Box>
                                                <SearchSectionHeader sx={{ px: 1, pt: 1, pb: 0.5 }}>Recipes</SearchSectionHeader>
                                                {results.recipes.map((r) => (
                                                    <SearchResultItem
                                                        key={r.id}
                                                        component={Link as React.ElementType}
                                                        href={recipeShow(r.id).url}
                                                        sx={{ px: 1, py: '6px' }}
                                                        onClick={close}
                                                    >
                                                        {r.title}
                                                    </SearchResultItem>
                                                ))}
                                            </Box>
                                        )}

                                        {results.shopping_items.length > 0 && (
                                            <Box>
                                                <SearchSectionHeader sx={{ px: 1, pt: 1, pb: 0.5 }}>Shopping Items</SearchSectionHeader>
                                                {results.shopping_items.map((item) => (
                                                    <SearchResultItem key={item.id} muted component="p" sx={{ px: 1, py: '6px' }}>
                                                        {item.name}
                                                    </SearchResultItem>
                                                ))}
                                            </Box>
                                        )}
                                    </>
                                )}
                            </Box>
                        </SearchPanel>
                    </Box>,
                    document.body,
                )}
        </Box>
    );
}
