import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDashboardStats, type DashboardStats } from '../../items/viewmodel/itemViewModel';
import { useAuthViewModel } from '../../auth/viewmodel/AuthViewModel';

export const useHomeViewModel = () => {
  const { user, loading: authLoading } = useAuthViewModel();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await fetchDashboardStats();
      setStats(dashboardStats);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHomeData();
  }, [loadHomeData]);

  const greeting = useMemo(() => {
    if (!user) return 'Welcome to FindPoint';
    const name = user.fullName || user.name || user.email || 'there';
    return `Welcome back, ${name.split(' ')[0]}.`;
  }, [user]);

  return {
    user,
    authLoading,
    stats,
    loading,
    error,
    greeting,
    refreshHome: loadHomeData,
  };
};