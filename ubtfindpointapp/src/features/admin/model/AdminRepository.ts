import api from '@/src/services/api';
import { IAdminItem, IAdminReport, IAdminStats } from './AdminModel';

export class AdminRepository {
  static async getDashboardStats(): Promise<IAdminStats> {
    const response = await api.get('/admin/dashboard');
    return response.data;
  }

  static async getItems(filters?: {
    search?: string;
    moderationStatus?: string;
    type?: string;
  }): Promise<IAdminItem[]> {
    const response = await api.get('/admin/items', { params: filters });
    return response.data?.data || [];
  }

  static async getItem(itemId: number): Promise<IAdminItem> {
    const response = await api.get(`/admin/items/${itemId}`);
    return response.data;
  }

  static async moderateItem(itemId: number, status: 'approved' | 'rejected'): Promise<void> {
    await api.patch(`/admin/items/${itemId}/moderate`, { status });
  }

  static async getReports(filters?: { status?: string }): Promise<IAdminReport[]> {
    const response = await api.get('/admin/reports', { params: filters });
    return response.data?.data || [];
  }

  static async reviewReport(reportId: number, status: 'approved' | 'dismissed'): Promise<void> {
    await api.patch(`/admin/reports/${reportId}`, { status });
  }
}
