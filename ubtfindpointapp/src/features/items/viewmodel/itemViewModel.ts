import { useState } from 'react';
import api from '../../../services/api';
import type { Item } from '../model/ItemModel';

type ItemMediaInput = {
  url: string;
};

type NewItemPayload = Omit<Item, 'item_id' | 'created_at' | 'updated_at' | 'media'> & {
  // media for creation is a simpler input form
  media?: ItemMediaInput[];
  // allow Date or string when creating
  date?: string | Date;
};

export const useItemViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (item: FormData | NewItemPayload) => {
    try {
      setLoading(true);
      setError(null);

      // Check if item is FormData (file upload) or JSON object
      if (item instanceof FormData) {
        // For FormData, don't add status here, it will be handled by backend
        const response = await api.post('/items/upload', item, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // For JSON, ensure Date values are stringified (backend expects string dates)
        const payload: any = { ...item, status: 'open' };
        if (payload.date instanceof Date) {
          payload.date = payload.date.toISOString().split('T')[0];
        }

        const response = await api.post('/items', payload);
        return response.data;
      }
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