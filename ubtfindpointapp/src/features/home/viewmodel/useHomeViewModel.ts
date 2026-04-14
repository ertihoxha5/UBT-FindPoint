import { useState, useEffect, useCallback } from 'react';

export interface HomePoint {
  id: string;
  name: string;
  description: string;
  location: string;
  type?: 'main' | 'branch';   
}

export const useHomeViewModel = () => {
  const [points, setPoints] = useState<HomePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPoints = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const mockPoints: HomePoint[] = [
        {
          id: '1',
          name: 'UBT Emshir',
          description: 'Kampusi kryesor i Universitetit për Biznes dhe Teknologji',
          location: 'Prishtinë',
          type: 'main',
        },
        {
          id: '2',
          name: 'UBT Dukagjini',
          description: 'Kampusi i UBT-së në Prishtinë',
          location: 'Prishtinë',
          type: 'branch',
        },
      
        {
          id: '3',
          name: 'UBT Lipjan',
          description: 'Kampusi i UBT-së në Lipjan',
          location: 'Lipjan',
          type: 'branch',
        },
        {
          id: '4',
          name: 'UBT Prizren',
          description: 'Kampusi i UBT-së në Prizren',
          location: 'Prizren',
          type: 'branch',
        },
      ];

      setPoints(mockPoints);
    } catch (err: any) {
      setError('Diçka shkoi keq gjatë ngarkimit të kampuseve. Provo përsëri.');
      console.error('Error loading points:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPoints();
  }, [loadPoints]);

  const refresh = useCallback(() => {
    loadPoints(true);
  }, [loadPoints]);

  return {
    points,
    loading,
    refreshing,        
    error,
    refresh,
  };
};