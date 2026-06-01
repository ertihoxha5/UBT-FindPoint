import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { notificationRepository, type Notification } from '../model/NotificationRepository';

export function useNotificationViewModel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingAllRead, setMarkingAllRead] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadNotifications = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const data = await notificationRepository.getNotifications();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string | number) => {
    try {
      await notificationRepository.markAsRead(notificationId);

      setNotifications(prev =>
        prev.map(n =>
          String(n.notification_id) === String(notificationId) ? { ...n, is_read: 1 } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (markingAllRead || unreadCount === 0) return;

    try {
      setMarkingAllRead(true);
      await notificationRepository.markAllAsRead();

      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw error; 
    } finally {
      setMarkingAllRead(false);
    }
  }, [markingAllRead, unreadCount]);

  const onRefresh = useCallback(() => loadNotifications(true), [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications])
  );

  return {
    notifications,
    unreadCount,
    loading,
    markingAllRead,
    refreshing,
    loadNotifications,
    markNotificationAsRead,
    markAllAsRead,
    onRefresh,
  };
}
