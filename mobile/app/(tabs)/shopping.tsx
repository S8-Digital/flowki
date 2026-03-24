import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRtdb } from '@/hooks/useRtdb';
import type { ShoppingItem, ShoppingList } from '@/lib/api';
import { shoppingApi } from '@/lib/api';
import { useAppSelector } from '@/store';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  FAB,
  Portal,
  TextInput,
} from 'react-native-paper';

function ShoppingItemRow({
  item,
  listId,
}: {
  item: ShoppingItem;
  listId: number;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const handleToggle = async () => {
    try {
      await shoppingApi.toggleItem(listId, item.id);
    } catch {
      Alert.alert('Error', 'Could not update item.');
    }
  };

  const handleDelete = async () => {
    try {
      await shoppingApi.removeItem(listId, item.id);
    } catch {
      Alert.alert('Error', 'Could not delete item.');
    }
  };

  return (
    <View style={styles.itemRow}>
      <TouchableOpacity onPress={handleToggle} style={styles.itemCheck}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: colors.tint,
              backgroundColor: item.is_checked ? colors.tint : 'transparent',
            },
          ]}
        />
      </TouchableOpacity>
      <ThemedText
        style={[
          styles.itemName,
          item.is_checked && {
            textDecorationLine: 'line-through',
            opacity: 0.5,
          },
        ]}
      >
        {item.name}
        {item.quantity ? ` (${item.quantity})` : ''}
      </ThemedText>
      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <ThemedText style={{ color: colors.destructive }}>✕</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

function ShoppingListCard({ list }: { list: ShoppingList }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const [addVisible, setAddVisible] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);

  const items = list.items ?? [];
  const remaining = items.filter((i) => !i.is_checked).length;

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    try {
      setSaving(true);
      await shoppingApi.addItem(list.id, { name: newItem.trim() });
      setNewItem('');
      setAddVisible(false);
    } catch {
      Alert.alert('Error', 'Could not add item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={[styles.listCard, { backgroundColor: colors.card }]}>
      <Card.Content>
        <View style={styles.listHeader}>
          <ThemedText variant="subtitle">{list.name}</ThemedText>
          <ThemedText variant="caption" style={{ color: colors.muted }}>
            {remaining} remaining
          </ThemedText>
        </View>
        {items.map((item) => (
          <ShoppingItemRow key={item.id} item={item} listId={list.id} />
        ))}
        <Button
          icon="plus"
          mode="text"
          compact
          onPress={() => setAddVisible(true)}
          style={styles.addItemBtn}
        >
          Add item
        </Button>
      </Card.Content>

      <Portal>
        <Dialog visible={addVisible} onDismiss={() => setAddVisible(false)}>
          <Dialog.Title>Add to {list.name}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Item name"
              value={newItem}
              onChangeText={setNewItem}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddVisible(false)}>Cancel</Button>
            <Button onPress={handleAddItem} loading={saving} disabled={saving}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Card>
  );
}

export default function ShoppingScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const user = useAppSelector((s) => s.auth.user);
  const familyId = user?.family_id;

  const { data: lists, isLoading } = useRtdb<Record<string, ShoppingList>>(
    familyId ? `families/${familyId}/shopping_lists` : null,
    {},
  );

  const [createVisible, setCreateVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [saving, setSaving] = useState(false);

  const shoppingLists = Object.values(lists).sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      setSaving(true);
      await shoppingApi.createList(newListName.trim());
      setNewListName('');
      setCreateVisible(false);
    } catch {
      Alert.alert('Error', 'Could not create list.');
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
      {shoppingLists.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText variant="muted">
            No shopping lists yet. Create one!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={shoppingLists}
          keyExtractor={(l) => String(l.id)}
          renderItem={({ item }) => <ShoppingListCard list={item} />}
          contentContainerStyle={styles.scroll}
        />
      )}

      <Portal>
        <Dialog
          visible={createVisible}
          onDismiss={() => setCreateVisible(false)}
        >
          <Dialog.Title>New Shopping List</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="List name"
              value={newListName}
              onChangeText={setNewListName}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateVisible(false)}>Cancel</Button>
            <Button
              onPress={handleCreateList}
              loading={saving}
              disabled={saving}
            >
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => setCreateVisible(true)}
        color="#FFFFFF"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, paddingBottom: 80 },
  listCard: { marginBottom: 16, borderRadius: 12 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  itemCheck: { marginRight: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  itemName: { flex: 1, fontSize: 15 },
  deleteBtn: { padding: 4 },
  addItemBtn: { marginTop: 8, alignSelf: 'flex-start' },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
