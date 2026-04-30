import api from '../../../services/api';
import type { Category } from '../model/CategoryModel';

export const useCategoryViewModel = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
};
