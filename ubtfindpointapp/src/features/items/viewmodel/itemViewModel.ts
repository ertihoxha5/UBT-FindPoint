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

export const fetchItems = async (options: FetchItemsOptions = {}) => {
  const response = await api.get('/items', {
    params: {
      type: options.type,
      userId: options.userId,
      recent: options.recent ? 'true' : undefined,
      limit: options.limit,
    },
  });

  return Array.isArray(response.data) ? response.data : [];
};

export const fetchMyItems = async () => {
  const response = await api.get('/items/mine');
  return Array.isArray(response.data) ? response.data : [];
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
}) => {
  const response = await api.put(`/items/${itemId}`, payload);
  return response.data;
};

export const markMyItemFound = async (itemId: number) => {
  const response = await api.patch(`/items/${itemId}/found`);
  return response.data;
};

export const deleteMyItem = async (itemId: number) => {
  const response = await api.delete(`/items/${itemId}`);
  return response.data;
};

export const useItemViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (item: FormData | NewItemPayload) => {
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
