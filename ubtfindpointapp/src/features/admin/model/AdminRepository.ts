import { API_BASE_URL } from '@/src/services/api';
import { getAuthToken } from '@/src/features/auth/model/AuthModel';
import { IAdminItem, IAdminReport, IAdminStats } from './AdminModel';

export class AdminRepository {
  static async getDashboardStats(): Promise<IAdminStats> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.json();
  }

  static async getItems(filters?: {
    search?: string;
    moderationStatus?: string;
    type?: string;
  }): Promise<IAdminItem[]> {
    const token = await getAuthToken();
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.moderationStatus) params.append('moderationStatus', filters.moderationStatus);
    if (filters?.type) params.append('type', filters.type);

    const response = await fetch(`${API_BASE_URL}/admin/items?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }

    const data = await response.json();
    return data.data || [];
  }

  static async getItem(itemId: number): Promise<IAdminItem> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/items/${itemId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch item');
    }

    return response.json();
  }

  static async moderateItem(itemId: number, status: 'approved' | 'rejected'): Promise<void> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/items/${itemId}/moderate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${status} item`);
    }
  }

  static async getReports(filters?: { status?: string }): Promise<IAdminReport[]> {
    const token = await getAuthToken();
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${API_BASE_URL}/admin/reports?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }

    const data = await response.json();
    return data.data || [];
  }

  static async reviewReport(reportId: number, status: 'approved' | 'dismissed'): Promise<void> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to ${status} report`);
    }
  }
}
