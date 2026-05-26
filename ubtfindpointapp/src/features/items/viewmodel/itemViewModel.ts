import { useState } from 'react';
import api from '../../../services/api';
import type { Item } from '../model/ItemModel';

type ItemMediaInput = {
  url: string;
};

type NewItemPayload = Omit<Item, 'item_id' | 'created_at' | 'updated_at' | 'media'> & {
  media?: ItemMediaInput[];
  date?: string | Date;
};

type FetchItemsOptions = {
  type?: 'lost' | 'found';
  recent?: boolean;
  limit?: number;
  userId?: number;
};

export interface DashboardStats {
  totalItems: number;
  totalLost: number;
  totalFound: number;
  resolvedItems: number;
  activeUsers: number;
  recoveryRate: number;
}

const normalizeDashboardStats = (data: any): DashboardStats => {
  const totalItems = Number(data?.totalItems ?? data?.approvedItems ?? 0);
  const resolvedItems = Number(data?.resolvedItems ?? 0);
  const activeUsers = Number(
    data?.activeUsers ??
    ((Number(data?.totalUsers ?? 0) || 0) - (Number(data?.blockedUsers ?? 0) || 0))
  );

  return {
    totalItems,
    totalLost: Number(data?.totalLost ?? 0),
    totalFound: Number(data?.totalFound ?? 0),
    resolvedItems,
    activeUsers: Math.max(activeUsers, 0),
    recoveryRate: Number(
      data?.recoveryRate ??
      (totalItems > 0 ? Math.round((resolvedItems / totalItems) * 100) : 0)
    ),
  };
};

// Mock data for when backend is not ready
const getMockDashboardStats = (): DashboardStats => {
  return {
    totalItems: 42,
    totalLost: 18,
    totalFound: 24,
    resolvedItems: 15,
    activeUsers: 127,
    recoveryRate: 36,
  };
};

export const fetchItems = async (options: FetchItemsOptions = {}): Promise<Item[]> => {
  try {
    const response = await api.get('/items', {
      params: {
        type: options.type,
        userId: options.userId,
        recent: options.recent ? 'true' : undefined,
        limit: options.limit,
      },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
};

export const fetchMyItems = async (): Promise<Item[]> => {
  try {
    const response = await api.get('/items/mine');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error?.response?.status !== 401) {
      console.error('Failed to fetch my items:', error);
    }
    return [];
  }
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/dashboard/stats');
    return normalizeDashboardStats(response.data);
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error?.message);
    
    // Return mock data if endpoint doesn't exist (404)
    if (error?.response?.status === 404) {
      console.log('Using mock dashboard stats (endpoint not ready)');
      return getMockDashboardStats();
    }
    
    // Return default stats for other errors
    return {
      totalItems: 0,
      totalLost: 0,
      totalFound: 0,
      resolvedItems: 0,
      activeUsers: 0,
      recoveryRate: 0,
    };
  }
};

export const updateMyItem = async (itemId: number, payload: {
  title: string;
  description?: string;
  type: 'lost' | 'found';
  category_id: number;
  location_id: number;
  date?: string;
  reward?: string;
  is_anonymous: boolean;
}): Promise<any> => {
  const response = await api.put(`/items/${itemId}`, payload);
  return response.data;
};

export const markMyItemFound = async (itemId: number): Promise<any> => {
  const response = await api.patch(`/items/${itemId}/found`);
  return response.data;
};

export const deleteMyItem = async (itemId: number): Promise<any> => {
  const response = await api.delete(`/items/${itemId}`);
  return response.data;
};

export const useItemViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (item: FormData | NewItemPayload): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      if (item instanceof FormData) {
        const response = await api.post('/items/upload', item, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }

      const payload: Record<string, any> = { ...item, status: 'open' };
      if (payload.date instanceof Date) {
        payload.date = payload.date.toISOString().split('T')[0];
      }

      const response = await api.post('/items', payload);
      return response.data;
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to create item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addItem,
    loading,
    error,
  };
};
