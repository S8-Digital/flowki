import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { AppNotification } from '@/lib/api';
import { notificationsApi } from '@/lib/api';

function notificationMessage(notification: AppNotification): string {
  const { data } = notification;
  const type = typeof data.type === 'string' ? data.type : '';

  switch (type) {
    case 'todo_assigned':
      return `You were assigned a task: ${String(data.todo_title ?? '')}`;
    case 'todo_completed':
      return `${String(data.completed_by_name ?? 'Someone')} completed: ${String(data.todo_title ?? '')}`;
    case 'todo_reminder':
      return `Reminder: ${String(data.todo_title ?? '')} is due soon`;
    case 'chore_assigned':
      return `You were assigned a chore: ${String(data.chore_title ?? '')}`;
    case 'chore_completed':
      return `${String(data.completed_by_name ?? 'Someone')} completed: ${String(data.chore_title ?? '')}`;
    case 'chore_reminder':
      return `Reminder: ${String(data.chore_title ?? '')} is due soon`;
    default:
      return 'You have a new notification';
  }
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  onMarkRead: (notification: AppNotification) => void;
  onDelete: (notification: AppNotification) => void;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const isUnread = !notification.read_at;

  return (
    <Card
      style={[
        styles.card,
        { backgroundColor: colors.card },
        isUnread && { borderColor: colors.tint, borderWidth: 1 },
      ]}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.messageBlock}>
          <ThemedText style={[styles.message, isUnread && styles.unreadMessage]}>
            {notificationMessage(notification)}
          </ThemedText>
          <ThemedText variant="caption" style={{ color: colors.muted }}>
            {formatDateTime(notification.created_at)}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          {isUnread && (
            <Button compact mode="text" onPress={() => onMarkRead(notification)}>
              Read
            </Button>
          )}
          <Button compact mode="text" onPress={() => onDelete(notification)} textColor={colors.destructive}>
            Delete
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationsApi.list();
      setNotifications(response?.notifications ?? []);
    } catch {
      Alert.alert('Error', 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read_at).length,
    [notifications],
  );

  const handleMarkRead = async (notification: AppNotification) => {
    try {
      setBusyId(notification.id);
      await notificationsApi.markRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );
    } catch {
      Alert.alert('Error', 'Could not mark notification as read.');
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await notificationsApi.markAllRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at ?? new Date().toISOString(),
        })),
      );
    } catch {
      Alert.alert('Error', 'Could not mark all notifications as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notification: AppNotification) => {
    try {
      setBusyId(notification.id);
      await notificationsApi.remove(notification.id);
      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id),
      );
    } catch {
      Alert.alert('Error', 'Could not delete notification.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="subtitle">Notifications</ThemedText>
        {unreadCount > 0 ? (
          <Button
            compact
            mode="outlined"
            onPress={handleMarkAllRead}
            disabled={markingAll || busyId !== null}
            loading={markingAll}
          >
            Mark all read
          </Button>
        ) : null}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <ThemedText variant="muted">You have no notifications.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(notification) => notification.id}
          renderItem={({ item }) => (
            <NotificationRow
              notification={item}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  list: { padding: 16, paddingTop: 12, gap: 12 },
  card: { borderRadius: 12 },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  messageBlock: { flex: 1, gap: 4 },
  message: { lineHeight: 20 },
  unreadMessage: { fontWeight: '600' },
  actions: { alignItems: 'flex-end', gap: 4 },
});
