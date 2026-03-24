import { useAppSelector } from '@/store';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  FAB,
  Portal,
  TextInput,
} from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRtdb } from '@/hooks/useRtdb';
import type { Todo } from '@/lib/api';
import { todosApi } from '@/lib/api';

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (t: Todo) => void;
  onDelete: (t: Todo) => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const done = todo.status === 'done';

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => onToggle(todo)}
        style={styles.itemCheck}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: colors.tint,
              backgroundColor: done ? colors.tint : 'transparent',
            },
          ]}
        />
      </TouchableOpacity>
      <View style={styles.itemContent}>
        <ThemedText
          style={[styles.itemTitle, done && { textDecorationLine: 'line-through', opacity: 0.5 }]}
        >
          {todo.title}
        </ThemedText>
        {todo.due_date && (
          <ThemedText variant="caption" style={{ color: colors.muted }}>
            Due {new Date(todo.due_date).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
      {todo.priority && (
        <Chip compact style={styles.priority}>
          {todo.priority}
        </Chip>
      )}
      <TouchableOpacity onPress={() => onDelete(todo)} style={styles.deleteBtn}>
        <ThemedText style={{ color: colors.destructive }}>✕</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default function TodosScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const user = useAppSelector((s) => s.auth.user);
  const familyId = user?.family_id;

  const { data: todos, isLoading } = useRtdb<Record<string, Todo>>(
    familyId ? `families/${familyId}/todos` : null,
    {},
  );

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const todoList = Object.values(todos).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const handleToggle = async (todo: Todo) => {
    try {
      await todosApi.update(todo.id, {
        status: todo.status === 'done' ? 'pending' : 'done',
      });
    } catch {
      Alert.alert('Error', 'Could not update todo.');
    }
  };

  const handleDelete = (todo: Todo) => {
    Alert.alert('Delete Todo', `Delete "${todo.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await todosApi.remove(todo.id);
          } catch {
            Alert.alert('Error', 'Could not delete todo.');
          }
        },
      },
    ]);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
return;
}

    try {
      setSaving(true);
      await todosApi.create({ title: newTitle.trim(), status: 'pending' });
      setNewTitle('');
      setDialogVisible(false);
    } catch {
      Alert.alert('Error', 'Could not create todo.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {todoList.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText variant="muted">No todos yet. Add one!</ThemedText>
        </View>
      ) : (
        <FlatList
          data={todoList}
          keyExtractor={(t) => String(t.id)}
          renderItem={({ item }) => (
            <TodoItem
              todo={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>New Todo</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newTitle}
              onChangeText={setNewTitle}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreate} loading={saving} disabled={saving}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => setDialogVisible(true)}
        color="#FFFFFF"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 80 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  itemCheck: { marginRight: 12 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '500' },
  priority: { marginHorizontal: 8 },
  deleteBtn: { padding: 4 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
