import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AdminShell, { adminStyles } from '@/src/features/admin/components/AdminShell';
import {
  deleteAdminItem,
  getAdminReports,
  reviewAdminReport,
  toggleAdminUserBlock,
} from '@/src/features/admin/service/adminService';

export default function AdminReportsScreen() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminReports({ status: 'all' });
      setReports(response.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return (
    <AdminShell
      title="Reported Items"
      subtitle="Review report reasons, clear false positives, or remove harmful content quickly."
      activeRoute="/admin/reports">
      <View style={adminStyles.card}>
        <Text style={adminStyles.cardTitle}>Escalation queue</Text>
        <Text style={adminStyles.cardSubtitle}>Review the context, decide whether the report is valid, and remove unsafe content when necessary.</Text>
        <View style={adminStyles.badgeRow}>
          <View style={adminStyles.badge}>
            <Text style={adminStyles.badgeText}>Open reports: {reports.length}</Text>
          </View>
          <View style={adminStyles.badge}>
            <Text style={adminStyles.badgeText}>Pending: {reports.filter((report) => report.status === 'pending').length}</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={[adminStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : reports.length ? (
        reports.map((report) => (
          <View key={report.report_id} style={adminStyles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.reportTitle}>#{report.report_id} | {report.item_title || 'Unknown item'}</Text>
              <View style={[styles.statusPill, report.status === 'pending' ? styles.pendingPill : styles.closedPill]}>
                <Text style={report.status === 'pending' ? styles.pendingPillText : styles.closedPillText}>
                  {String(report.status).toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.reportMeta}>Reason: {report.reason}</Text>
            <Text style={styles.reportMeta}>Reporter: {report.reported_by_name || 'Unknown'} | Owner: {report.owner_name || 'Unknown'}</Text>
            {report.details ? <Text style={styles.reportBody}>{report.details}</Text> : null}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={adminStyles.button}
                onPress={async () => {
                  await reviewAdminReport(report.report_id, 'approved');
                  loadReports();
                }}
                activeOpacity={0.88}>
                <Text style={adminStyles.buttonText}>Approve report</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adminStyles.secondaryButton}
                onPress={async () => {
                  await reviewAdminReport(report.report_id, 'dismissed');
                  loadReports();
                }}
                activeOpacity={0.88}>
                <Text style={adminStyles.secondaryButtonText}>Dismiss</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adminStyles.dangerButton}
                onPress={() =>
                  Alert.alert('Delete item', 'Delete the reported item from the platform?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteAdminItem(report.item_id);
                        loadReports();
                      },
                    },
                  ])
                }
                activeOpacity={0.88}>
                <Text style={adminStyles.dangerButtonText}>Delete item</Text>
              </TouchableOpacity>
              {report.owner_user_id ? (
                <TouchableOpacity
                  style={adminStyles.dangerButton}
                  onPress={async () => {
                    await toggleAdminUserBlock(report.owner_user_id, true);
                    loadReports();
                  }}
                  activeOpacity={0.88}>
                  <Text style={adminStyles.dangerButtonText}>Block owner</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))
      ) : (
        <View style={adminStyles.card}>
          <Text style={styles.emptyText}>No reported items right now.</Text>
        </View>
      )}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  pendingPill: {
    backgroundColor: '#fff7ed',
  },
  pendingPillText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '800',
  },
  closedPill: {
    backgroundColor: '#eef4fb',
  },
  closedPillText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '800',
  },
  reportTitle: {
    color: '#10233f',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  reportMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6,
  },
  reportBody: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 14,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
