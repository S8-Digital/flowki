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
        if (listId) return shoppingItems[Number(listId)] ?? null;
        const first = Object.values(shoppingItems)[0];
        return first ?? null;
    }

    const list = resolvedList();

    return (
        <div className="flex flex-col gap-2">
            {list ? (
                <>
                    <p className="text-xs font-medium text-muted-foreground">{list.name}</p>
                    {list.items.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">Nothing left to buy!</div>
                    ) : (
                        <ul className="space-y-1.5">
                            {list.items.map((item) => (
                                <li key={item.id} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm">
                                    <div className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
                                    <span className="flex-1 truncate">{item.name}</span>
                                    {item.quantity && <span className="shrink-0 text-xs text-muted-foreground">{item.quantity}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No shopping lists yet.</div>
            )}
        </div>
    );
}
