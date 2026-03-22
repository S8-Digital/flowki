import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const ListLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const ListItemBox = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    overflow: 'hidden',
    fontSize: '0.875rem',
    borderRadius: Number(theme.shape.borderRadius),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75),
}));

const DotBox = styled(Box)({
    width: 6,
    height: 6,
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
    opacity: 0.6,
});

const ItemNameSpan = styled('span')({
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const QuantitySpan = styled('span')({
    flexShrink: 0,
    fontSize: '0.75rem',
    opacity: 0.7,
});

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {list ? (
                <>
                    <ListLabel>{list.name}</ListLabel>
                    {list.items.length === 0 ? (
                        <EmptyStateBox sx={{ py: 4 }}>Nothing left to buy!</EmptyStateBox>
                    ) : (
                        <Stack spacing={0.75} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                            {list.items.map((item) => (
                                <ListItemBox key={item.id}>
                                    <DotBox />
                                    <ItemNameSpan>{item.name}</ItemNameSpan>
                                    {item.quantity && <QuantitySpan>{item.quantity}</QuantitySpan>}
                                </ListItemBox>
                            ))}
                        </Stack>
                    )}
                </>
            ) : (
                <EmptyStateBox sx={{ py: 4 }}>No shopping lists yet.</EmptyStateBox>
            )}
        </Box>
    );
}
