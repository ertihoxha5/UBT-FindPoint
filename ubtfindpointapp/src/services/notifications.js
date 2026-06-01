import api from './api';

export const fetchNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data; 
};

export const markNotificationRead = async (notificationId) => {
  const res = await api.patch(`/notifications/${notificationId}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch('/notifications/read-all');
  return res.data;
};

export default {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
