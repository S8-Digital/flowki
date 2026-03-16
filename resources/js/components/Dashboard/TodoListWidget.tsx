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
    return { low: 'bg-green-500', medium: 'bg-yellow-500', high: 'bg-red-500' }[priority] ?? 'bg-muted';
}

export default function TodoListWidget({ todos }: TodoListWidgetProps) {
    return (
        <div className="flex flex-col gap-2">
            {todos.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No todos due today.</div>
            ) : (
                <ul className="space-y-2">
                    {todos.map((todo) => (
                        <li key={todo.id} className="flex items-center gap-3 rounded-lg border p-3">
                            <div className={`size-2 shrink-0 rounded-full ${priorityColor(todo.priority)}`} />
                            <div className="min-w-0 flex-1">
                                <p className={`truncate text-sm font-medium ${todo.status === 'completed' ? 'line-through opacity-50' : ''}`}>
                                    {todo.title}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">{todo.category}</p>
                            </div>
                            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">{todo.status.replace('_', ' ')}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
