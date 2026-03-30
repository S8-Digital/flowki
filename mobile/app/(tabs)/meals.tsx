import { useAppSelector } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
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
import type { Meal, Recipe, ShoppingList } from '@/lib/api';
import { mealsApi, recipesApi, shoppingApi } from '@/lib/api';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
];

const MEAL_TYPE_ORDER = new Map(MEAL_TYPES.map((type, index) => [type.value, index]));

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekStart(date: Date): string {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  return toDateString(start);
}

function getWeekDays(weekStart: string) {
  const start = new Date(`${weekStart}T00:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      key: toDateString(date),
      label: date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  });
}

function offsetWeek(weekStart: string, delta: number): string {
  const date = new Date(`${weekStart}T00:00:00`);
  date.setDate(date.getDate() + delta * 7);

  return toDateString(date);
}

function formatWeekLabel(weekStart: string): string {
  const days = getWeekDays(weekStart);
  const first = new Date(`${days[0].key}T00:00:00`);
  const last = new Date(`${days[6].key}T00:00:00`);

  return `${first.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${last.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function isMealInWeek(meal: Meal, weekStart: string): boolean {
  if (!meal.planned_date) {
    return false;
  }

  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(`${weekStart}T00:00:00`);
  end.setDate(end.getDate() + 6);
  const mealDate = new Date(`${meal.planned_date}T00:00:00`);

  return mealDate >= start && mealDate <= end;
}

function sortMeals(a: Meal, b: Meal): number {
  if (a.planned_date !== b.planned_date) {
    return String(a.planned_date).localeCompare(String(b.planned_date));
  }

  return (MEAL_TYPE_ORDER.get(a.meal_type ?? '') ?? 99) - (MEAL_TYPE_ORDER.get(b.meal_type ?? '') ?? 99);
}

function MealCard({
  meal,
  shoppingLists,
  onAddGroceries,
  onDelete,
}: {
  meal: Meal;
  shoppingLists: ShoppingList[];
  onAddGroceries: (meal: Meal) => void;
  onDelete: (meal: Meal) => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  return (
    <Card style={[styles.mealCard, { backgroundColor: colors.card }]}>
      <Card.Content style={styles.mealCardContent}>
        <View style={styles.mealText}>
          <ThemedText style={styles.mealTitle}>
            {meal.recipe?.title ?? 'Meal'}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: colors.muted }}>
            {(meal.meal_type ?? 'meal').replace(/^./, (value) => value.toUpperCase())}
            {meal.servings ? ` · ${meal.servings} serving${meal.servings === 1 ? '' : 's'}` : ''}
          </ThemedText>
          {meal.notes ? (
            <ThemedText variant="muted" style={styles.mealNotes}>
              {meal.notes}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.mealActions}>
          {meal.recipe_id && shoppingLists.length > 0 ? (
            <Button compact mode="text" onPress={() => onAddGroceries(meal)}>
              Groceries
            </Button>
          ) : null}
          <Button compact mode="text" onPress={() => onDelete(meal)} textColor={colors.destructive}>
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function MealsScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const familyId = user?.family_id;
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [contextLoading, setContextLoading] = useState(true);

  const [createVisible, setCreateVisible] = useState(false);
  const [groceryVisible, setGroceryVisible] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
  const [plannedDate, setPlannedDate] = useState(weekStart);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [mealType, setMealType] = useState('dinner');
  const [servings, setServings] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: mealsById, isLoading: mealsLoading } = useRtdb<Record<string, Meal>>(
    familyId ? `families/${familyId}/meals` : null,
    {},
  );

  useEffect(() => {
    let cancelled = false;

    const loadContext = async () => {
      if (!familyId) {
        setRecipes([]);
        setShoppingLists([]);
        setContextLoading(false);

        return;
      }

      try {
        const [recipesResponse, shoppingResponse] = await Promise.all([
          recipesApi.list(),
          shoppingApi.lists(),
        ]);

        if (!cancelled) {
          setRecipes(recipesResponse ?? []);
          setShoppingLists(shoppingResponse ?? []);
        }
      } catch {
        if (!cancelled) {
          Alert.alert('Error', 'Could not load meal planning data.');
        }
      } finally {
        if (!cancelled) {
          setContextLoading(false);
        }
      }
    };

    void loadContext();

    return () => {
      cancelled = true;
    };
  }, [familyId]);

  const meals = useMemo(
    () =>
      Object.values(mealsById)
        .filter((meal) => isMealInWeek(meal, weekStart))
        .map((meal) => ({
          ...meal,
          recipe: meal.recipe ?? recipes.find((recipe) => recipe.id === meal.recipe_id) ?? null,
        }))
        .sort(sortMeals),
    [mealsById, recipes, weekStart],
  );

  const days = useMemo(
    () =>
      getWeekDays(weekStart).map((day) => ({
        ...day,
        meals: meals.filter((meal) => meal.planned_date === day.key),
      })),
    [meals, weekStart],
  );

  const weekLabel = useMemo(() => formatWeekLabel(weekStart), [weekStart]);

  const openCreateDialog = (date: string) => {
    setPlannedDate(date);
    setSelectedRecipeId(null);
    setMealType('dinner');
    setServings('');
    setNotes('');
    setSelectedListId(null);
    setCreateVisible(true);
  };

  const handleCreate = async () => {
    if (!plannedDate.trim()) {
      Alert.alert('Error', 'Please choose a date.');

      return;
    }

    try {
      setSaving(true);
      await mealsApi.create({
        planned_date: plannedDate.trim(),
        meal_type: mealType,
        recipe_id: selectedRecipeId,
        servings: servings.trim() ? Number(servings) : null,
        notes: notes.trim() || null,
        shopping_list_id: selectedListId,
      });
      setCreateVisible(false);
    } catch {
      Alert.alert('Error', 'Could not save meal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (meal: Meal) => {
    Alert.alert('Delete Meal', `Delete "${meal.recipe?.title ?? 'this meal'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await mealsApi.remove(meal.id);
          } catch {
            Alert.alert('Error', 'Could not delete meal.');
          }
        },
      },
    ]);
  };

  const handleAddGroceries = (meal: Meal) => {
    setSelectedMealId(meal.id);
    setSelectedListId(shoppingLists[0]?.id ?? null);
    setGroceryVisible(true);
  };

  const confirmAddGroceries = async () => {
    if (!selectedMealId || !selectedListId) {
      return;
    }

    try {
      setSaving(true);
      await mealsApi.addGroceries(selectedMealId, selectedListId);
      setGroceryVisible(false);
      setSelectedMealId(null);
    } catch {
      Alert.alert('Error', 'Could not add ingredients to shopping list.');
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading || mealsLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (!familyId) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText variant="muted">Join or create a family to plan meals.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Button onPress={() => setWeekStart(offsetWeek(weekStart, -1))}>Prev</Button>
        <ThemedText variant="subtitle">{weekLabel}</ThemedText>
        <Button onPress={() => setWeekStart(offsetWeek(weekStart, 1))}>Next</Button>
      </View>

      <FlatList
        data={days}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText variant="muted">No meals planned for this week.</ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.dayCard}>
            <Card.Content>
              <View style={styles.dayHeader}>
                <ThemedText variant="subtitle">{item.label}</ThemedText>
                <Button compact mode="text" onPress={() => openCreateDialog(item.key)}>
                  Add Meal
                </Button>
              </View>

              {item.meals.length === 0 ? (
                <ThemedText variant="muted">No meals planned.</ThemedText>
              ) : (
                item.meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    shoppingLists={shoppingLists}
                    onAddGroceries={handleAddGroceries}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Dialog visible={createVisible} onDismiss={() => setCreateVisible(false)}>
          <Dialog.Title>Add Meal</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Date (YYYY-MM-DD)"
              value={plannedDate}
              onChangeText={setPlannedDate}
              mode="outlined"
              style={styles.input}
            />

            <ThemedText variant="caption" style={styles.dialogLabel}>
              Meal type
            </ThemedText>
            <View style={styles.optionWrap}>
              {MEAL_TYPES.map((type) => (
                <Button
                  key={type.value}
                  mode={mealType === type.value ? 'contained' : 'outlined'}
                  onPress={() => setMealType(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </View>

            <ThemedText variant="caption" style={styles.dialogLabel}>
              Recipe
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionWrap}>
                <Button mode={selectedRecipeId === null ? 'contained' : 'outlined'} onPress={() => setSelectedRecipeId(null)}>
                  No recipe
                </Button>
                {recipes.map((recipe) => (
                  <Button
                    key={recipe.id}
                    mode={selectedRecipeId === recipe.id ? 'contained' : 'outlined'}
                    onPress={() => setSelectedRecipeId(recipe.id)}
                  >
                    {recipe.title}
                  </Button>
                ))}
              </View>
            </ScrollView>

            {selectedRecipeId && shoppingLists.length > 0 ? (
              <>
                <ThemedText variant="caption" style={styles.dialogLabel}>
                  Add ingredients to shopping list
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.optionWrap}>
                    <Button mode={selectedListId === null ? 'contained' : 'outlined'} onPress={() => setSelectedListId(null)}>
                      Don&apos;t add
                    </Button>
                    {shoppingLists.map((list) => (
                      <Button
                        key={list.id}
                        mode={selectedListId === list.id ? 'contained' : 'outlined'}
                        onPress={() => setSelectedListId(list.id)}
                      >
                        {list.name}
                      </Button>
                    ))}
                  </View>
                </ScrollView>
              </>
            ) : null}

            <TextInput
              label="Servings"
              value={servings}
              onChangeText={setServings}
              mode="outlined"
              style={styles.input}
              keyboardType="numeric"
            />
            <TextInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCreateVisible(false)}>Cancel</Button>
            <Button onPress={handleCreate} disabled={saving} loading={saving}>
              Save Meal
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={groceryVisible} onDismiss={() => setGroceryVisible(false)}>
          <Dialog.Title>Add to Shopping List</Dialog.Title>
          <Dialog.Content>
            <View style={styles.optionColumn}>
              {shoppingLists.map((list) => (
                <Button
                  key={list.id}
                  mode={selectedListId === list.id ? 'contained' : 'outlined'}
                  onPress={() => setSelectedListId(list.id)}
                >
                  {list.name}
                </Button>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setGroceryVisible(false)}>Cancel</Button>
            <Button onPress={confirmAddGroceries} disabled={!selectedListId || saving} loading={saving}>
              Add Ingredients
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => openCreateDialog(weekStart)}
        color="#FFFFFF"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 12,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: { padding: 16, paddingBottom: 96, gap: 12 },
  dayCard: { marginBottom: 12 },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealCard: { marginBottom: 8 },
  mealCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  mealText: { flex: 1 },
  mealTitle: { fontWeight: '600' },
  mealNotes: { marginTop: 4 },
  mealActions: { alignItems: 'flex-end' },
  empty: { alignItems: 'center', paddingVertical: 32 },
  input: { marginBottom: 12 },
  dialogLabel: { marginBottom: 8 },
  optionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  optionColumn: {
    gap: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#3B82F6',
  },
});
