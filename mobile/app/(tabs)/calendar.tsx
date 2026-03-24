import { useAppSelector } from '@/store';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
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
import type { CalendarEvent } from '@/lib/api';
import { calendarApi } from '@/lib/api';

type MarkedDates = Record<
  string,
  {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  }
>;

function EventCard({ event }: { event: CalendarEvent }) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];

  const handleDelete = () => {
    Alert.alert('Delete Event', `Delete "${event.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await calendarApi.remove(event.id);
          } catch {
            Alert.alert('Error', 'Could not delete event.');
          }
        },
      },
    ]);
  };

  const start = new Date(event.start_at);
  const end = new Date(event.end_at);

  return (
    <Card
      style={[
        styles.eventCard,
        {
          backgroundColor: colors.card,
          borderLeftColor: event.color ?? colors.tint,
          borderLeftWidth: 4,
        },
      ]}
      onLongPress={handleDelete}
    >
      <Card.Content>
        <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
        <ThemedText variant="caption" style={{ color: colors.muted }}>
          {event.is_all_day
            ? 'All day'
            : `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </ThemedText>
        {event.description ? (
          <ThemedText variant="muted" style={styles.eventDesc}>
            {event.description}
          </ThemedText>
        ) : null}
      </Card.Content>
    </Card>
  );
}

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const user = useAppSelector((s) => s.auth.user);
  const familyId = user?.family_id;

  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(today);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: events, isLoading } = useRtdb<Record<string, CalendarEvent>>(
    familyId ? `families/${familyId}/calendar_events` : null,
    {},
  );

  const markedDates: MarkedDates = {};
  Object.values(events).forEach((e) => {
    const date = e.start_at.slice(0, 10);
    markedDates[date] = { marked: true, dotColor: e.color ?? colors.tint };
  });

  // Highlight selected day
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] ?? {}),
    selected: true,
    selectedColor: colors.tint,
  };

  const dayEvents = Object.values(events)
    .filter((e) => e.start_at.startsWith(selectedDate))
    .sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
    );

  const handleCreate = async () => {
    if (!newTitle.trim() || !newStart.trim() || !newEnd.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');

      return;
    }

    try {
      setSaving(true);
      await calendarApi.create({
        title: newTitle.trim(),
        start_at: newStart.trim(),
        end_at: newEnd.trim(),
      });
      setNewTitle('');
      setNewStart('');
      setNewEnd('');
      setDialogVisible(false);
    } catch {
      Alert.alert('Error', 'Could not create event.');
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
      <Calendar
        current={selectedDate}
        onDayPress={(day: { dateString: string }) =>
          setSelectedDate(day.dateString)
        }
        markedDates={markedDates}
        theme={{
          backgroundColor: colors.background,
          calendarBackground: colors.background,
          textSectionTitleColor: colors.muted,
          selectedDayBackgroundColor: colors.tint,
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: colors.tint,
          dayTextColor: colors.text,
          textDisabledColor: colors.border,
          monthTextColor: colors.text,
          arrowColor: colors.tint,
        }}
      />

      <View style={styles.dayHeader}>
        <ThemedText variant="subtitle">
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>
      </View>

      {dayEvents.length === 0 ? (
        <View style={styles.emptyDay}>
          <ThemedText variant="muted">No events on this day</ThemedText>
        </View>
      ) : (
        <FlatList
          data={dayEvents}
          keyExtractor={(e) => String(e.id)}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.eventList}
        />
      )}

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>New Event</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Title"
              value={newTitle}
              onChangeText={setNewTitle}
              mode="outlined"
              style={styles.dialogInput}
              autoFocus
            />
            <TextInput
              label="Start (YYYY-MM-DD HH:MM)"
              value={newStart}
              onChangeText={setNewStart}
              mode="outlined"
              style={styles.dialogInput}
              placeholder={`${selectedDate} 09:00`}
            />
            <TextInput
              label="End (YYYY-MM-DD HH:MM)"
              value={newEnd}
              onChangeText={setNewEnd}
              mode="outlined"
              placeholder={`${selectedDate} 10:00`}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreate} loading={saving} disabled={saving}>
              Create
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => {
          setNewStart(`${selectedDate} 09:00`);
          setNewEnd(`${selectedDate} 10:00`);
          setDialogVisible(true);
        }}
        color="#FFFFFF"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dayHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyDay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 32,
  },
  eventList: { padding: 16, paddingBottom: 80 },
  eventCard: { marginBottom: 10, borderRadius: 10 },
  eventTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  eventDesc: { marginTop: 4 },
  dialogInput: { marginBottom: 12 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
