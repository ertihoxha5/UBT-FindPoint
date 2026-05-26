export interface INotification {
  notification_id: number;
  recipient_user_id?: number;
  audience: 'user' | 'admin';
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata_json?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface INotificationContext {
  userId: number;
  isAdmin: boolean;
}

export interface INotificationResponse {
  notifications: INotification[];
  unreadCount: number;
}
