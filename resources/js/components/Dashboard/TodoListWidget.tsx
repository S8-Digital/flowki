import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { styled, alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

const EmptyStateBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
}));

const TodoItemLi = styled('li')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    overflow: 'hidden',
    borderRadius: Number(theme.shape.borderRadius) * 2,
    padding: theme.spacing(1.5),
}));

const PriorityDot = styled(Box)({
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: '50%',
});

const TodoTitle = styled(Typography)({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '0.875rem',
    fontWeight: 500,
});

const CategoryLabel = styled(Typography)({
    fontSize: '0.75rem',
    textTransform: 'capitalize',
    opacity: 0.7,
});

const StatusBadge = styled('span')(({ theme }) => ({
    flexShrink: 0,
    borderRadius: '9999px',
    backgroundColor: alpha(theme.palette.common.white, 0.6),
    fontSize: '0.75rem',
    textTransform: 'capitalize',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '2px',
    paddingBottom: '2px',
}));

interface TodoItem {
    id: number;
    title: string;
    status: string;
    priority: string;
    category: string;
    due_date: string | null;
}

interface TodoListWidgetProps {
    todos: TodoItem[];
    categoryFilter?: string;
}

function priorityColor(priority: string): string {
    return { low: '#22c55e', medium: '#fbbf24', high: '#ef4444' }[priority] ?? 'var(--muted)';
}

export default function TodoListWidget({ todos }: TodoListWidgetProps) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {todos.length === 0 ? (
                <EmptyStateBox sx={{ py: 4 }}>No todos due today.</EmptyStateBox>
            ) : (
                <Stack spacing={1} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {todos.map((todo) => (
                        <TodoItemLi key={todo.id}>
                            <PriorityDot style={{ backgroundColor: priorityColor(todo.priority) }} />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <TodoTitle
                                    style={{
                                        textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                                        opacity: todo.status === 'completed' ? 0.5 : 1,
                                    }}
                                >
                                    {todo.title}
                                </TodoTitle>
                                <CategoryLabel>{todo.category}</CategoryLabel>
                            </Box>
                            <StatusBadge>{todo.status.replace('_', ' ')}</StatusBadge>
                        </TodoItemLi>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
