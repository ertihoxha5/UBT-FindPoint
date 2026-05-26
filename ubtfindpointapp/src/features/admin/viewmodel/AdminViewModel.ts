import { useCallback, useState } from 'react';
import { AdminRepository } from '../model/AdminRepository';
import { IAdminItem, IAdminReport, IAdminStats } from '../model/AdminModel';

export interface IAdminViewModel {
  // Dashboard
  stats: IAdminStats | null;
  statsLoading: boolean;
  loadDashboard: () => Promise<void>;

  // Items
  items: IAdminItem[];
  itemsLoading: boolean;
  itemsError: string | null;
  getItems: (filters?: { search?: string; moderationStatus?: string; type?: string }) => Promise<void>;
  moderateItem: (itemId: number, status: 'approved' | 'rejected') => Promise<void>;

  // Reports
  reports: IAdminReport[];
  reportsLoading: boolean;
  getReports: (status?: string) => Promise<void>;
  reviewReport: (reportId: number, status: 'approved' | 'dismissed') => Promise<void>;

  // General
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAdminViewModel = (): IAdminViewModel => {
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [items, setItems] = useState<IAdminItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [reports, setReports] = useState<IAdminReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setStatsLoading(true);
      setError(null);
      const data = await AdminRepository.getDashboardStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
      setError(errorMessage);
      console.error('Failed to load dashboard:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const getItems = useCallback(async (filters?: { search?: string; moderationStatus?: string; type?: string }) => {
    try {
      setItemsLoading(true);
      setItemsError(null);
      const data = await AdminRepository.getItems(filters);
      setItems(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load items';
      setItemsError(errorMessage);
      console.error('Failed to load items:', err);
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const moderateItem = useCallback(async (itemId: number, status: 'approved' | 'rejected') => {
    try {
      await AdminRepository.moderateItem(itemId, status);
      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item.item_id === itemId
            ? { ...item, moderation_status: status }
            : item
        )
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${status} item`;
      setError(errorMessage);
      console.error(`Failed to ${status} item:`, err);
      throw err;
    }
  }, []);

  const getReports = useCallback(async (status?: string) => {
    try {
      setReportsLoading(true);
      setError(null);
      const data = await AdminRepository.getReports({ status });
      setReports(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reports';
      setError(errorMessage);
      console.error('Failed to load reports:', err);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  const reviewReport = useCallback(async (reportId: number, status: 'approved' | 'dismissed') => {
    try {
      await AdminRepository.reviewReport(reportId, status);
      // Update local state
      setReports((prev) =>
        prev.map((report) =>
          report.report_id === reportId
            ? { ...report, status, reviewed_at: new Date().toISOString() }
            : report
        )
      );
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${status} report`;
      setError(errorMessage);
      console.error(`Failed to ${status} report:`, err);
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      await Promise.all([loadDashboard(), getItems()]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh';
      setError(errorMessage);
    }
  }, [loadDashboard, getItems]);

  return {
    stats,
    statsLoading,
    loadDashboard,
    items,
    itemsLoading,
    itemsError,
    getItems,
    moderateItem,
    reports,
    reportsLoading,
    getReports,
    reviewReport,
    error,
    refresh,
  };
};
