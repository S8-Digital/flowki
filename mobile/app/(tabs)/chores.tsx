import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRtdb } from '@/hooks/useRtdb';
import type { Chore } from '@/lib/api';
import { choresApi } from '@/lib/api';
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

function ChoreItem({
  chore,
  onComplete,
  onDelete,
}: {
  chore: Chore;
  onComplete: (c: Chore) => void;
  onDelete: (c: Chore) => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const isCompleted =
    chore.last_completed_at != null &&
    chore.next_due_date != null &&
    new Date(chore.last_completed_at) >= new Date(chore.next_due_date);

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => onComplete(chore)}
        style={styles.itemCheck}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: colors.success,
              backgroundColor: isCompleted ? colors.success : 'transparent',
            },
          ]}
        />
      </TouchableOpacity>
      <View style={styles.itemContent}>
        <ThemedText
          style={[
            styles.itemTitle,
            isCompleted && { textDecorationLine: 'line-through', opacity: 0.5 },
          ]}
        >
          {chore.title}
        </ThemedText>
        {chore.next_due_date && (
          <ThemedText variant="caption" style={{ color: colors.muted }}>
            Due {new Date(chore.next_due_date).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
      {chore.frequency && (
        <Chip compact style={styles.chip}>
          {chore.frequency}
        </Chip>
      )}
      <TouchableOpacity onPress={() => onDelete(chore)} style={styles.deleteBtn}>
        <ThemedText style={{ color: colors.destructive }}>✕</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

export default function ChoresScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const user = useAppSelector((s) => s.auth.user);
  const familyId = user?.family_id;

  const { data: chores, isLoading } = useRtdb<Record<string, Chore>>(
    familyId ? `families/${familyId}/chores` : null,
    {},
  );

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [saving, setSaving] = useState(false);

  const choreList = Object.values(chores).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const handleComplete = async (chore: Chore) => {
    try {
      await choresApi.complete(chore.id);
    } catch {
      Alert.alert('Error', 'Could not mark chore as complete.');
    }
  };

  const handleDelete = (chore: Chore) => {
    Alert.alert('Delete Chore', `Delete "${chore.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await choresApi.remove(chore.id);
          } catch {
            Alert.alert('Error', 'Could not delete chore.');
          }
        },
      },
    ]);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      setSaving(true);
      await choresApi.create({
        title: newTitle.trim(),
        frequency: newFrequency.trim() || undefined,
      });
      setNewTitle('');
      setNewFrequency('');
      setDialogVisible(false);
    } catch {
      Alert.alert('Error', 'Could not create chore.');
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
      {choreList.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText variant="muted">No chores yet. Add one!</ThemedText>
        </View>
      ) : (
        <FlatList
          data={choreList}
          keyExtractor={(c) => String(c.id)}
          renderItem={({ item }) => (
            <ChoreItem
              chore={item}
              onComplete={handleComplete}
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
          <Dialog.Title>New Chore</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newTitle}
              onChangeText={setNewTitle}
              mode="outlined"
              autoFocus
              style={styles.dialogInput}
            />
            <TextInput
              label="Frequency (e.g. daily, weekly)"
              value={newFrequency}
              onChangeText={setNewFrequency}
              mode="outlined"
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
    borderRadius: 4,
    borderWidth: 2,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '500' },
  chip: { marginHorizontal: 8 },
  deleteBtn: { padding: 4 },
  dialogInput: { marginBottom: 12 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
