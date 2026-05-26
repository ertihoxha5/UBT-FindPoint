import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/src/services/notifications';

export interface Notification {
  notification_id: string | number;
  title: string;
  message: string;
  created_at: string;
  is_read: 0 | 1;
  link?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

class NotificationRepository {
  async getNotifications(): Promise<NotificationsResponse> {
    const data = await fetchNotifications();
    return {
      notifications: data.notifications || [],
      unreadCount: Number(data.unreadCount || 0),
    };
  }

  async markAsRead(notificationId: string | number): Promise<void> {
    await markNotificationRead(notificationId);
  }

  async markAllAsRead(): Promise<void> {
    await markAllNotificationsRead();
  }
}

export const notificationRepository = new NotificationRepository();