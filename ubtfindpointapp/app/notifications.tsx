import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/src/services/notifications';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Notification {
  notification_id: string | number;
  title: string;
  message: string;
  created_at: string;
  is_read: 0 | 1;
  link?: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [markingAllRead, setMarkingAllRead] = React.useState<boolean>(false);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);

  const loadNotifications = React.useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data: NotificationsResponse = await fetchNotifications();
      
      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch (e) {
      console.error('Failed to load notifications:', e);
      if (!showRefreshing) {
        Alert.alert('Error', 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const onRefresh = () => loadNotifications(true);

  const onPressNotification = async (item: Notification) => {
    try {
      if (!item.is_read) {
        await markNotificationRead(item.notification_id);

        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === item.notification_id ? { ...n, is_read: 1 } : n
          )
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }

      if (item.link) {
        const route = item.link.replace(/^\//, '');
        router.push(route as any);
      }
    } catch (e) {
      console.error('Failed to handle notification:', e);
    }
  };

  const markAllAsRead = async () => {
    if (markingAllRead || unreadCount === 0) return;

    try {
      setMarkingAllRead(true);
      await markAllNotificationsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all as read:', e);
      Alert.alert('Error', 'Failed to mark all notifications as read. Please try again.');
    } finally {
      setMarkingAllRead(false);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => onPressNotification(item)}
      style={[
        styles.item,
        item.is_read ? styles.read : styles.unread,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconSymbol
          name="bell.fill"
          size={20}
          color={item.is_read ? '#9aa8bd' : '#4a90e2'}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
        </View>
      </View>

      <Text style={styles.time}>
        {new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>

        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={markAllAsRead}
          style={styles.markAllBtn}
          disabled={markingAllRead || unreadCount === 0}
        >
          <Text style={[
            styles.markAllText,
            (markingAllRead || unreadCount === 0) && { color: '#9aa8bd' }
          ]}>
            {markingAllRead ? 'Marking...' : 'Mark all read'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.notification_id)}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && !refreshing ? (
            <Text style={styles.emptyText}>No notifications yet</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  header: { fontSize: 20, fontWeight: '700', flex: 1 },
  unreadBadge: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markAllText: { 
    color: '#4a90e2', 
    fontWeight: '600' 
  },

  item: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  unread: { borderLeftWidth: 3, borderLeftColor: '#4a90e2' },
  read: { opacity: 0.85 },

  title: { fontWeight: '700', fontSize: 15, marginBottom: 2 },
  message: { color: '#6b7785', lineHeight: 18 },
  time: { color: '#9aa8bd', fontSize: 12, marginTop: 8, alignSelf: 'flex-end' },

  listContent: { padding: 16 },
  emptyText: {
    textAlign: 'center',
    color: '#9aa8bd',
    marginTop: 60,
    fontSize: 16,
  },
});