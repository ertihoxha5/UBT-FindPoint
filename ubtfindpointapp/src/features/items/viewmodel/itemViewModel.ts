import { useState } from 'react';
import api from '../../../services/api';

type ItemMediaInput = {
  url: string;
};

export const useItemViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = async (item: FormData | {
    title: string;
    description?: string;
    type: 'lost' | 'found';
    category_id: number;
    location_id: number;
    found_date?: string;
    reward?: string;
    is_anonymous: boolean;
    media?: ItemMediaInput[];
  }) => {
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
        // For JSON, add status as before
        const response = await api.post('/items', {
          ...item,
          status: 'open',
        });
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