import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todos.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>No todos due today.</Box>
            ) : (
                <Stack spacing={1} component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {todos.map((todo) => (
                        <Box
                            component="li"
                            key={todo.id}
                            className="category-todos-item"
                            sx={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', borderRadius: 2, p: 1.5 }}
                        >
                            <Box sx={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', bgcolor: priorityColor(todo.priority) }} />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        ...(todo.status === 'completed' ? { textDecoration: 'line-through', opacity: 0.5 } : {}),
                                    }}
                                >
                                    {todo.title}
                                </Typography>
                                <Typography sx={{ fontSize: '0.75rem', textTransform: 'capitalize', opacity: 0.7 }}>{todo.category}</Typography>
                            </Box>
                            <Box
                                component="span"
                                sx={{
                                    flexShrink: 0,
                                    borderRadius: '9999px',
                                    bgcolor: 'rgba(255,255,255,0.6)',
                                    px: '8px',
                                    py: '2px',
                                    fontSize: '0.75rem',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {todo.status.replace('_', ' ')}
                            </Box>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
}
