import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AdminShell, { adminStyles } from '@/src/features/admin/components/AdminShell';
import { approveAdminItem, deleteAdminItem, getAdminItems, updateAdminItem } from '@/src/features/admin/service/adminService';

export default function AdminItemsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminItems({ search });
      setItems(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

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
        <Text style={adminStyles.cardTitle}>Search items</Text>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search by item title or owner" placeholderTextColor="#94a3b8" style={adminStyles.input} />
        <TouchableOpacity style={adminStyles.button} onPress={loadItems} activeOpacity={0.88}>
          <Text style={adminStyles.buttonText}>Refresh items</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[adminStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        items.map((item) => (
          <View key={item.item_id} style={adminStyles.card}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>
              {item.type.toUpperCase()} • {String(item.moderation_status || 'approved').toUpperCase()} • {item.report_count || 0} pending reports
            </Text>
            <Text style={styles.itemMeta}>{item.fullName || 'Unknown owner'} • {item.category_name || 'No category'}</Text>
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
