export interface IAdminItem {
  item_id: number;
  user_id?: number;
  title: string;
  description: string;
  type: 'lost' | 'found';
  status: 'open' | 'claimed' | 'resolved' | 'expired';
  moderation_status: 'pending' | 'approved' | 'rejected';
  category_id: number;
  location_id: number;
  category_name: string;
  location_name: string;
  date?: string;
  reward?: string;
  is_anonymous: boolean;
  user_name?: string;
  user_email?: string;
  created_at: string;
  updated_at: string;
}

export interface IAdminReport {
  report_id: number;
  item_id: number;
  reported_by: number;
  reason: string;
  details?: string;
  status: 'pending' | 'approved' | 'dismissed';
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  item_title?: string;
  reporter_name?: string;
}

export interface IAdminStats {
  totalUsers: number;
  totalAdmins: number;
  blockedUsers: number;
  totalItems: number;
  approvedItems: number;
  pendingItems: number;
  rejectedItems: number;
  resolvedItems: number;
  openItems: number;
  totalReports: number;
  pendingReports: number;
  approvedReports: number;
  dismissedReports: number;
  totalAdminNotifications: number;
  unreadAdminNotifications: number;
}
