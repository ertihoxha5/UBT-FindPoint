import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AdminShell, { adminStyles } from '@/src/features/admin/components/AdminShell';
import { deleteAdminUser, getAdminUsers, toggleAdminUserBlock, updateAdminUser } from '@/src/features/admin/service/adminService';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers({ search });
      setUsers(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const saveUser = async () => {
    if (!editingUser) return;
    await updateAdminUser(editingUser.userId, editingUser);
    setEditingUser(null);
    loadUsers();
  };

  return (
    <AdminShell
      title="User Management"
      subtitle="Search, edit, block, and remove accounts with admin-level controls."
      activeRoute="/admin/users">
      <View style={[adminStyles.card, { gap: 12 }]}>
        <Text style={adminStyles.cardTitle}>Search users</Text>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or email" placeholderTextColor="#94a3b8" style={adminStyles.input} />
        <TouchableOpacity style={adminStyles.button} onPress={loadUsers} activeOpacity={0.88}>
          <Text style={adminStyles.buttonText}>Refresh users</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={[adminStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        users.map((user) => (
          <View key={user.userId} style={adminStyles.card}>
            <Text style={styles.userName}>{user.fullName}</Text>
            <Text style={styles.userMeta}>{user.email}</Text>
            <Text style={styles.userMeta}>
              {user.role.toUpperCase()} • {user.isBlocked ? 'Blocked' : 'Active'} • {user.itemCount} posts
            </Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={adminStyles.secondaryButton} onPress={() => setEditingUser({ ...user })} activeOpacity={0.88}>
                <Text style={adminStyles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adminStyles.secondaryButton}
                onPress={async () => {
                  await toggleAdminUserBlock(user.userId, !user.isBlocked);
                  loadUsers();
                }}
                activeOpacity={0.88}>
                <Text style={adminStyles.secondaryButtonText}>{user.isBlocked ? 'Unblock' : 'Block'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={adminStyles.dangerButton}
                onPress={() =>
                  Alert.alert('Delete user', 'This user and related content will be removed.', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteAdminUser(user.userId);
                        loadUsers();
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

      <Modal visible={Boolean(editingUser)} transparent animationType="fade" onRequestClose={() => setEditingUser(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={adminStyles.cardTitle}>Edit user</Text>
            <TextInput style={adminStyles.input} value={editingUser?.fullName || ''} onChangeText={(value) => setEditingUser((current: any) => ({ ...current, fullName: value }))} placeholder="Full name" />
            <TextInput style={adminStyles.input} value={editingUser?.email || ''} onChangeText={(value) => setEditingUser((current: any) => ({ ...current, email: value }))} placeholder="Email" />
            <TextInput style={adminStyles.input} value={editingUser?.faculty || ''} onChangeText={(value) => setEditingUser((current: any) => ({ ...current, faculty: value }))} placeholder="Faculty" />
            <TextInput style={adminStyles.input} value={editingUser?.phoneNumber || ''} onChangeText={(value) => setEditingUser((current: any) => ({ ...current, phoneNumber: value }))} placeholder="Phone number" />
            <TextInput style={adminStyles.input} value={editingUser?.bio || ''} onChangeText={(value) => setEditingUser((current: any) => ({ ...current, bio: value }))} placeholder="Bio" />
            <View style={styles.actionRow}>
              <TouchableOpacity style={adminStyles.secondaryButton} onPress={() => setEditingUser((current: any) => ({ ...current, role: current.role === 'admin' ? 'user' : 'admin' }))}>
                <Text style={adminStyles.secondaryButtonText}>Role: {editingUser?.role || 'user'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={adminStyles.button} onPress={saveUser} activeOpacity={0.88}>
                <Text style={adminStyles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={adminStyles.secondaryButton} onPress={() => setEditingUser(null)} activeOpacity={0.88}>
                <Text style={adminStyles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  userName: {
    color: '#10233f',
    fontSize: 17,
    fontWeight: '800',
  },
  userMeta: {
    color: '#64748b',
    marginTop: 4,
    fontSize: 13,
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
  },
});
