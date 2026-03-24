import { useAppSelector } from '@/store';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Card } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRtdb } from '@/hooks/useRtdb';
import type { CalendarEvent, Chore, ShoppingList, Todo, WeatherData } from '@/lib/api';
import { weatherApi } from '@/lib/api';

type WidgetKey = 'schedule' | 'todos' | 'shopping' | 'chores' | 'weather';

interface Widget {
  id: WidgetKey;
  label: string;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: 'weather', label: 'Weather' },
  { id: 'schedule', label: "Today's Schedule" },
  { id: 'todos', label: 'Todos' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'chores', label: 'Chores' },
];

function ScheduleWidget({ events }: { events: Record<string, CalendarEvent> }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayEvents = Object.values(events).filter((e) =>
    e.start_at.startsWith(today),
  );

  return (
    <View>
      {todayEvents.length === 0 ? (
        <ThemedText variant="muted">No events today</ThemedText>
      ) : (
        todayEvents.map((e) => (
          <ThemedText key={e.id} style={styles.widgetItem}>
            {new Date(e.start_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            – {e.title}
          </ThemedText>
        ))
      )}
    </View>
  );
}

function TodosWidget({ todos }: { todos: Record<string, Todo> }) {
  const pending = Object.values(todos)
    .filter((t) => t.status !== 'done')
    .slice(0, 5);

  return (
    <View>
      {pending.length === 0 ? (
        <ThemedText variant="muted">All caught up!</ThemedText>
      ) : (
        pending.map((t) => (
          <ThemedText key={t.id} style={styles.widgetItem}>
            • {t.title}
          </ThemedText>
        ))
      )}
    </View>
  );
}

function ShoppingWidget({ lists }: { lists: Record<string, ShoppingList> }) {
  const unchecked = Object.values(lists)
    .flatMap((l) => (l.items ?? []).filter((i) => !i.is_checked))
    .slice(0, 5);

  return (
    <View>
      {unchecked.length === 0 ? (
        <ThemedText variant="muted">Nothing to buy</ThemedText>
      ) : (
        unchecked.map((i) => (
          <ThemedText key={i.id} style={styles.widgetItem}>
            • {i.name}
          </ThemedText>
        ))
      )}
    </View>
  );
}

function ChoresWidget({ chores }: { chores: Record<string, Chore> }) {
  const due = Object.values(chores).slice(0, 5);

  return (
    <View>
      {due.length === 0 ? (
        <ThemedText variant="muted">No chores assigned</ThemedText>
      ) : (
        due.map((c) => (
          <ThemedText key={c.id} style={styles.widgetItem}>
            • {c.title}
          </ThemedText>
        ))
      )}
    </View>
  );
}

function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    weatherApi
      .get()
      .then((d) => {
        if (!cancelled) {
setWeather(d);
}
      })
      .catch(() => {
        /* graceful degradation — weather widget hides itself */
      })
      .finally(() => {
        if (!cancelled) {
setLoading(false);
}
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.weatherLoading}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!weather) {
    return null;
  }

  const { current, forecast, location } = weather;

  return (
    <View>
      <View style={styles.weatherCurrent}>
        {current.icon_url ? (
          <Image source={{ uri: current.icon_url }} style={styles.weatherIcon} />
        ) : null}
        <View>
          <ThemedText style={styles.weatherTemp}>{current.temp}°C</ThemedText>
          <ThemedText variant="muted" style={styles.weatherDesc}>
            {current.description}
          </ThemedText>
          <ThemedText variant="muted" style={styles.weatherFeels}>
            Feels {current.feels_like}°C · {current.humidity}% · {current.wind_speed} km/h
          </ThemedText>
        </View>
      </View>
      <ThemedText variant="muted" style={styles.weatherLocation}>
        📍 {location}
      </ThemedText>
      {forecast.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastRow}>
          {forecast.slice(0, 7).map((day) => (
            <View key={day.date} style={styles.forecastDay}>
              <ThemedText style={styles.forecastDayLabel}>
                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </ThemedText>
              {day.icon_url ? (
                <Image source={{ uri: day.icon_url }} style={styles.forecastIcon} />
              ) : null}
              <ThemedText style={styles.forecastTemp}>
                {day.temp_max}° / {day.temp_min}°
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const user = useAppSelector((s) => s.auth.user);
  const familyId = user?.family_id;

  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);

  const { data: todos } = useRtdb<Record<string, Todo>>(
    familyId ? `families/${familyId}/todos` : null,
    {},
  );
  const { data: chores } = useRtdb<Record<string, Chore>>(
    familyId ? `families/${familyId}/chores` : null,
    {},
  );
  const { data: shoppingLists } = useRtdb<Record<string, ShoppingList>>(
    familyId ? `families/${familyId}/shopping_lists` : null,
    {},
  );
  const { data: events } = useRtdb<Record<string, CalendarEvent>>(
    familyId ? `families/${familyId}/calendar_events` : null,
    {},
  );

  const moveUp = (index: number) => {
    if (index === 0) {
return;
}

    setWidgets((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];

      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === widgets.length - 1) {
return;
}

    setWidgets((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];

      return next;
    });
  };

  const renderWidget = (widget: Widget, index: number) => {
    const content = () => {
      switch (widget.id) {
        case 'weather':
          return <WeatherWidget />;
        case 'schedule':
          return <ScheduleWidget events={events} />;
        case 'todos':
          return <TodosWidget todos={todos} />;
        case 'shopping':
          return <ShoppingWidget lists={shoppingLists} />;
        case 'chores':
          return <ChoresWidget chores={chores} />;
      }
    };

    return (
      <Card
        key={widget.id}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Card.Content>
          <View style={styles.widgetHeader}>
            <ThemedText variant="subtitle">{widget.label}</ThemedText>
            <View style={styles.reorderButtons}>
              <TouchableOpacity
                onPress={() => moveUp(index)}
                disabled={index === 0}
                style={styles.reorderBtn}
              >
                <ThemedText style={{ opacity: index === 0 ? 0.3 : 1 }}>
                  ↑
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => moveDown(index)}
                disabled={index === widgets.length - 1}
                style={styles.reorderBtn}
              >
                <ThemedText
                  style={{ opacity: index === widgets.length - 1 ? 0.3 : 1 }}
                >
                  ↓
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          {content()}
        </Card.Content>
      </Card>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText variant="title" style={styles.greeting}>
          Hey, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </ThemedText>
        {widgets.map((widget, index) => renderWidget(widget, index))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 32 },
  greeting: { marginBottom: 20 },
  card: { marginBottom: 16, borderRadius: 12 },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reorderButtons: { flexDirection: 'row', gap: 8 },
  reorderBtn: { padding: 4 },
  widgetItem: { marginBottom: 4 },
  // Weather styles
  weatherLoading: { alignItems: 'center', paddingVertical: 16 },
  weatherCurrent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  weatherIcon: { width: 56, height: 56 },
  weatherTemp: { fontSize: 28, fontWeight: '700' },
  weatherDesc: { fontSize: 13, textTransform: 'capitalize', marginTop: 2 },
  weatherFeels: { fontSize: 11, marginTop: 2 },
  weatherLocation: { fontSize: 11, marginTop: 8, letterSpacing: 0.5 },
  forecastRow: { marginTop: 12 },
  forecastDay: { alignItems: 'center', marginRight: 12, minWidth: 52 },
  forecastDayLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  forecastIcon: { width: 28, height: 28 },
  forecastTemp: { fontSize: 11, marginTop: 2 },
});
