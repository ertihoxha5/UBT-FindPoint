import * as WebBrowser from 'expo-web-browser';
import api from '../../../services/api';
import { getStoredToken } from '../../../services/session';

export const getAdminDashboard = () => api.get('/admin/dashboard');
export const getAdminUsers = (params?: { search?: string; status?: string; role?: string }) => api.get('/admin/users', { params });
export const updateAdminUser = (userId: number, payload: any) => api.put(`/admin/users/${userId}`, payload);
export const toggleAdminUserBlock = (userId: number, isBlocked: boolean) =>
  api.patch(`/admin/users/${userId}/block`, { isBlocked });
export const deleteAdminUser = (userId: number) => api.delete(`/admin/users/${userId}`);

export const getAdminItems = (params?: { search?: string; moderationStatus?: string; type?: string; status?: string }) =>
  api.get('/admin/items', { params });
export const getAdminItemDetails = (itemId: number) => api.get(`/admin/items/${itemId}`);
export const updateAdminItem = (itemId: number, payload: any) => api.put(`/admin/items/${itemId}`, payload);
export const approveAdminItem = (itemId: number) => api.patch(`/admin/items/${itemId}/approve`);
export const deleteAdminItem = (itemId: number) => api.delete(`/admin/items/${itemId}`);

export const getAdminReports = (params?: { status?: string }) => api.get('/admin/reports', { params });
export const reviewAdminReport = (reportId: number, status: 'approved' | 'dismissed') =>
  api.patch(`/admin/reports/${reportId}`, { status });

export const reportItem = (itemId: number, payload: { reason: string; details?: string }) =>
  api.post(`/items/${itemId}/report`, payload);

export const openAdminDashboardPdf = async () => {
  const token = await getStoredToken();
  const url = new URL('admin/dashboard/report.pdf', `${api.defaults.baseURL}/`);
  url.searchParams.set('token', token || '');
  await WebBrowser.openBrowserAsync(url.toString());
};
