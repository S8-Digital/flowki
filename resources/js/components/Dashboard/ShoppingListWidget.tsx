import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface ShoppingItemData {
    id: number;
    name: string;
    quantity: string | null;
    category: string;
    is_checked: boolean;
}

interface ShoppingListData {
    id: number;
    name: string;
    items: ShoppingItemData[];
}

interface ShoppingListWidgetProps {
    shoppingItems: Record<number, ShoppingListData>;
    listId?: number | string;
    shoppingLists: { id: number; name: string }[];
}

export default function ShoppingListWidget({ shoppingItems, listId }: ShoppingListWidgetProps) {
    function resolvedList(): ShoppingListData | null {
        if (listId) {
            return shoppingItems[Number(listId)] ?? null;
        }

        const first = Object.values(shoppingItems)[0];

        return first ?? null;
    }

    const list = resolvedList();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {list ? (
                <>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>{list.name}</Typography>
                    {list.items.length === 0 ? (
                        <Box sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Nothing left to buy!</Box>
                    ) : (
                        <Stack spacing={0.75} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                            {list.items.map((item) => (
                                <Box
                                    component="li"
                                    key={item.id}
                                    className="category-shopping-item"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        overflow: 'hidden',
                                        borderRadius: 1,
                                        px: 1,
                                        py: 0.75,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    <Box sx={{ width: 6, height: 6, flexShrink: 0, borderRadius: '50%', bgcolor: 'currentColor', opacity: 0.6 }} />
                                    <Box component="span" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.name}
                                    </Box>
                                    {item.quantity && (
                                        <Box component="span" sx={{ flexShrink: 0, fontSize: '0.75rem', opacity: 0.7 }}>
                                            {item.quantity}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </>
            ) : (
                <Box sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>No shopping lists yet.</Box>
            )}
        </Box>
    );
}
