import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { UtensilsCrossed } from 'lucide-react';

const EmptyStateBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const DinnerItem = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    overflow: 'hidden',
    borderRadius: Number(theme.shape.borderRadius) * 2,
    padding: theme.spacing(1.25),
    backgroundColor: theme.palette.action.hover,
}));

const DayLabel = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    minWidth: 32,
    flexShrink: 0,
}));

const MealTitle = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: 500,
});

interface DinnerEntry {
    id: number;
    planned_date: string | null;
    meal_type: string | null;
    notes: string | null;
    recipe: {
        id: number;
        title: string;
        photo_path: string | null;
        rating: number | null;
    } | null;
}

interface MealPlannerWidgetProps {
    weekDinners: DinnerEntry[];
}

const DAY_SHORT: Record<number, string> = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

function formatDay(dateStr: string | null): string {
    if (!dateStr) {
        return '?';
    }

    const d = new Date(dateStr + 'T00:00:00');

    return DAY_SHORT[d.getDay()] ?? '?';
}

export default function MealPlannerWidget({ weekDinners }: MealPlannerWidgetProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {weekDinners.length === 0 ? (
                <EmptyStateBox sx={{ py: 4 }}>
                    <UtensilsCrossed size={20} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                    <Box>No dinners planned this week.</Box>
                </EmptyStateBox>
            ) : (
                <Stack spacing={0.75} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {weekDinners.map((dinner) => (
                        <DinnerItem key={dinner.id}>
                            <DayLabel>{formatDay(dinner.planned_date)}</DayLabel>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <MealTitle>{dinner.recipe?.title ?? dinner.notes ?? 'Dinner'}</MealTitle>
                            </Box>
                        </DinnerItem>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
