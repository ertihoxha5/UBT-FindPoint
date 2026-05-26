import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AdminShell, { adminStyles } from '@/src/features/admin/components/AdminShell';
import { getAdminDashboard, openAdminDashboardPdf } from '@/src/features/admin/service/adminService';
import { useAuthViewModel } from '@/src/features/auth/viewmodel/AuthViewModel';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const auth = useAuthViewModel();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard();
      setDashboard(response.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const logout = async () => {
    await auth.logout();
    router.replace('/login');
  };

  return (
    <AdminShell
      title="Admin Dashboard"
      subtitle="Moderate the platform, track health metrics, and export operational reports."
      activeRoute="/admin"
      rightAction={
        <View style={{ gap: 10 }}>
          <TouchableOpacity style={styles.heroButton} onPress={openAdminDashboardPdf} activeOpacity={0.88}>
            <Text style={styles.heroButtonText}>PDF report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.heroGhostButton} onPress={logout} activeOpacity={0.88}>
            <Text style={styles.heroGhostButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      }>
      {loading ? (
        <View style={[adminStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard label="Total users" value={dashboard?.totalUsers} icon="people-outline" tint="#2563eb" />
            <StatCard label="Total items" value={dashboard?.totalItems} icon="cube-outline" tint="#0f766e" />
            <StatCard label="Approved items" value={dashboard?.approvedItems} icon="checkmark-circle-outline" tint="#16a34a" />
            <StatCard label="Pending items" value={dashboard?.pendingItems} icon="time-outline" tint="#d97706" />
            <StatCard label="Reported items" value={dashboard?.totalReports} icon="flag-outline" tint="#dc2626" />
            <StatCard label="Blocked users" value={dashboard?.blockedUsers} icon="ban-outline" tint="#7c3aed" />
          </View>

          <View style={adminStyles.card}>
            <Text style={adminStyles.cardTitle}>Operations snapshot</Text>
            <Text style={adminStyles.cardSubtitle}>Use these numbers to spot review queues and potential moderation bottlenecks.</Text>
            <View style={adminStyles.badgeRow}>
              <View style={adminStyles.badge}>
                <Text style={adminStyles.badgeText}>Pending reports: {dashboard?.pendingReports ?? 0}</Text>
              </View>
              <View style={adminStyles.badge}>
                <Text style={adminStyles.badgeText}>Open items: {dashboard?.openItems ?? 0}</Text>
              </View>
              <View style={adminStyles.badge}>
                <Text style={adminStyles.badgeText}>Unread admin notifications: {dashboard?.unreadAdminNotifications ?? 0}</Text>
              </View>
            </View>
          </View>

          <View style={adminStyles.card}>
            <Text style={adminStyles.cardTitle}>Activity trend</Text>
            <Text style={adminStyles.cardSubtitle}>A rolling view of new items and signups over the last 7 days.</Text>
            {(dashboard?.itemsByDay || []).map((entry: any) => (
              <BarRow key={`items-${entry.bucket}`} label={`Items ${entry.bucket}`} value={entry.total} color="#2563eb" />
            ))}
            {(dashboard?.usersByDay || []).map((entry: any) => (
              <BarRow key={`users-${entry.bucket}`} label={`Users ${entry.bucket}`} value={entry.total} color="#059669" />
            ))}
          </View>

          <View style={adminStyles.card}>
            <Text style={adminStyles.cardTitle}>Recent activity</Text>
            {dashboard?.recentActivity?.length ? (
              dashboard.recentActivity.map((activity: any) => (
                <View key={activity.activity_id} style={styles.activityRow}>
                  <Text style={styles.activityTitle}>
                    {activity.admin_name || 'Admin'} {activity.action_type} {activity.action_target}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {activity.target_id ? `#${activity.target_id} | ` : ''}
                    {new Date(activity.created_at).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent admin activity yet.</Text>
            )}
          </View>
        </>
      )}
    </AdminShell>
  );
}

function StatCard({ label, value, icon, tint }: { label: string; value: number; icon: keyof typeof Ionicons.glyphMap; tint: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: `${tint}18` }]}>
        <Ionicons name={icon} size={20} color={tint} />
      </View>
      <Text style={styles.statValue}>{value ?? 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarRow({ label, value, color }: { label: string; value: number; color: string }) {
  const width = Math.max(12, Math.min(100, Number(value || 0) * 12));
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  heroButtonText: {
    color: '#10233f',
    fontWeight: '700',
  },
  heroGhostButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroGhostButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: '#10233f',
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  barValue: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e5edf6',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  activityRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
  },
  activityTitle: {
    color: '#10233f',
    fontSize: 14,
    fontWeight: '700',
  },
  activityMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
