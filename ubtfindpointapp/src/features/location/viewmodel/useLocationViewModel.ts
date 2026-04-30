import api from '../../../services/api';
import type { Location } from '../model/LocationModel';

export const useLocationViewModel = {
  getLocations: async (): Promise<Location[]> => {
    const response = await api.get('/locations');
    return response.data;
  },
};
