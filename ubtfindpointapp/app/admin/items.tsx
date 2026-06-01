import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AdminShell, { adminStyles } from '@/src/features/admin/components/AdminShell';
import {
  approveAdminItem,
  deleteAdminItem,
  getAdminItems,
  updateAdminItem,
} from '@/src/features/admin/service/adminService';

export default function AdminItemsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'claimed' | 'resolved' | 'expired'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [moderationFilter, setModerationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminItems({
        search,
        status: statusFilter,
        type: typeFilter,
        moderationStatus: moderationFilter,
      });
      setItems(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter, moderationFilter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const saveItem = async () => {
    if (!editingItem) return;
    await updateAdminItem(editingItem.item_id, editingItem);
    setEditingItem(null);
    loadItems();
  };

  return (
    <AdminShell
      title="Item Moderation"
      subtitle="Approve new submissions, inspect details, update records, and remove problematic items."
      activeRoute="/admin/items">
      <View style={[adminStyles.card, { gap: 12 }]}>
        <Text style={adminStyles.cardTitle}>Review queue</Text>
        <Text style={adminStyles.cardSubtitle}>Search by title or owner, monitor pending approvals, and act on moderation issues quickly.</Text>
        <View style={adminStyles.badgeRow}>
          <View style={adminStyles.badge}>
            <Text style={adminStyles.badgeText}>Loaded: {items.length}</Text>
          </View>
          <View style={adminStyles.badge}>
            <Text style={adminStyles.badgeText}>Pending: {items.filter((item) => item.moderation_status === 'pending').length}</Text>
          </View>
        </View>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search title, owner, category, location" placeholderTextColor="#94a3b8" style={adminStyles.input} />
        <View style={styles.filterGroup}>
          {(['all', 'lost', 'found'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, typeFilter === option && styles.filterChipActive]}
              onPress={() => setTypeFilter(option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, typeFilter === option && styles.filterChipTextActive]}>
                {option === 'all' ? 'All types' : option === 'lost' ? 'Lost' : 'Found'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterGroup}>
          {(['all', 'open', 'claimed', 'resolved', 'expired'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, statusFilter === option && styles.filterChipActive]}
              onPress={() => setStatusFilter(option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, statusFilter === option && styles.filterChipTextActive]}>
                {option === 'all' ? 'All statuses' : option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterGroup}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, moderationFilter === option && styles.filterChipActive]}
              onPress={() => setModerationFilter(option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, moderationFilter === option && styles.filterChipTextActive]}>
                {option === 'all' ? 'All moderation' : option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={adminStyles.button} onPress={loadItems} activeOpacity={0.88}>
            <Text style={adminStyles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={[adminStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        items.map((item) => (
          <View key={item.item_id} style={adminStyles.card}>
            <View style={styles.headerRow}>
              <View style={styles.metaPillRow}>
                <View style={[styles.metaPill, styles.typePill]}>
                  <Text style={styles.typePillText}>{String(item.type).toUpperCase()}</Text>
                </View>
                <View style={[styles.metaPill, item.moderation_status === 'pending' ? styles.pendingPill : styles.approvedPill]}>
                  <Text style={item.moderation_status === 'pending' ? styles.pendingPillText : styles.approvedPillText}>
                    {String(item.moderation_status || 'approved').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.reportCount}>{item.report_count || 0} reports</Text>
            </View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>Owner: {item.fullName || 'Unknown owner'} | {item.email || 'No email'}</Text>
            <Text style={styles.itemMeta}>Category: {item.category_name || 'No category'} | Location: {item.location_name || 'Unknown'}</Text>
            <Text style={styles.itemMeta}>Status: {String(item.status || 'open').toUpperCase()} | Joined: {new Date(item.created_at).toLocaleDateString()}</Text>
            <Text style={styles.itemBody} numberOfLines={3}>
              {item.description || 'No description provided.'}
            </Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={adminStyles.button}
                onPress={async () => {
                  await approveAdminItem(item.item_id);
                  loadItems();
                }}
                activeOpacity={0.88}>
                <Text style={adminStyles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={adminStyles.secondaryButton} onPress={() => setEditingItem({ ...item })} activeOpacity={0.88}>
                <Text style={adminStyles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adminStyles.dangerButton}
                onPress={() =>
                  Alert.alert('Delete item', 'This item will be removed permanently.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteAdminItem(item.item_id);
                        loadItems();
                      },
                    },
                  ])
                }
                activeOpacity={0.88}>
                <Text style={adminStyles.dangerButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal visible={Boolean(editingItem)} transparent animationType="fade" onRequestClose={() => setEditingItem(null)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalCard} contentContainerStyle={{ paddingBottom: 8 }}>
            <Text style={adminStyles.cardTitle}>Edit item</Text>
            <Text style={adminStyles.cardSubtitle}>Update the record and save your moderation changes.</Text>
            <TextInput style={adminStyles.input} value={editingItem?.title || ''} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, title: value }))} placeholder="Title" />
            <TextInput style={[adminStyles.input, { height: 110, textAlignVertical: 'top', paddingTop: 14 }]} multiline value={editingItem?.description || ''} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, description: value }))} placeholder="Description" />
            <TextInput style={adminStyles.input} value={editingItem?.type || ''} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, type: value }))} placeholder="Type" />
            <TextInput style={adminStyles.input} value={editingItem?.status || ''} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, status: value }))} placeholder="Status" />
            <TextInput style={adminStyles.input} value={editingItem?.moderation_status || ''} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, moderation_status: value }))} placeholder="Moderation status" />
            <TextInput style={adminStyles.input} value={String(editingItem?.category_id || '')} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, category_id: Number(value) || 0 }))} placeholder="Category ID" />
            <TextInput style={adminStyles.input} value={String(editingItem?.location_id || '')} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, location_id: Number(value) || 0 }))} placeholder="Location ID" />
            <TextInput style={adminStyles.input} value={editingItem?.reward || ''} onChangeText={(value) => setEditingItem((current: any) => ({ ...current, reward: value }))} placeholder="Reward" />
            <View style={styles.actionRow}>
              <TouchableOpacity style={adminStyles.button} onPress={saveItem} activeOpacity={0.88}>
                <Text style={adminStyles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={adminStyles.secondaryButton} onPress={() => setEditingItem(null)} activeOpacity={0.88}>
                <Text style={adminStyles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  metaPillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typePill: {
    backgroundColor: '#eef4fb',
  },
  typePillText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '800',
  },
  pendingPill: {
    backgroundColor: '#fff7ed',
  },
  pendingPillText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '800',
  },
  approvedPill: {
    backgroundColor: '#ecfdf5',
  },
  approvedPillText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
  },
  reportCount: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  itemTitle: {
    color: '#10233f',
    fontSize: 17,
    fontWeight: '800',
  },
  itemMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  itemBody: {
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
  filterGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eef4fb',
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterChipText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 12,
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    maxHeight: '85%',
  },
});
