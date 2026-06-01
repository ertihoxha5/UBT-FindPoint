import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AdminShell, { adminStyles } from '@/src/features/admin/components/AdminShell';
import {
  deleteAdminUser,
  getAdminUsers,
  toggleAdminUserBlock,
  updateAdminUser,
} from '@/src/features/admin/service/adminService';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers({ search, status: statusFilter, role: roleFilter });
      setUsers(response.data || []);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, roleFilter]);

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
        <Text style={adminStyles.cardTitle}>People overview</Text>
        <Text style={adminStyles.cardSubtitle}>Review account health, update user details, and intervene when suspicious activity appears.</Text>
        <View style={adminStyles.badgeRow}>
          <View style={adminStyles.badge}>
            <Text style={adminStyles.badgeText}>Loaded: {users.length}</Text>
          </View>
          <View style={adminStyles.badge}>
            <Text style={adminStyles.badgeText}>Blocked: {users.filter((user) => user.isBlocked).length}</Text>
          </View>
          <View style={adminStyles.badge}>
            <Text style={adminStyles.badgeText}>Admins: {users.filter((user) => user.role === 'admin').length}</Text>
          </View>
        </View>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search name, email, faculty, phone" placeholderTextColor="#94a3b8" style={adminStyles.input} />
        <View style={styles.filterGroup}>
          {(['all', 'active', 'blocked'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, statusFilter === option && styles.filterChipActive]}
              onPress={() => setStatusFilter(option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, statusFilter === option && styles.filterChipTextActive]}>
                {option === 'all' ? 'All status' : option === 'active' ? 'Active' : 'Blocked'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterGroup}>
          {(['all', 'user', 'admin'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, roleFilter === option && styles.filterChipActive]}
              onPress={() => setRoleFilter(option)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterChipText, roleFilter === option && styles.filterChipTextActive]}>
                {option === 'all' ? 'All roles' : option === 'user' ? 'Users' : 'Admins'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={adminStyles.button} onPress={loadUsers} activeOpacity={0.88}>
            <Text style={adminStyles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={[adminStyles.card, { alignItems: 'center', paddingVertical: 30 }]}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        users.map((user) => (
          <View key={user.userId} style={adminStyles.card}>
            <View style={styles.headerRow}>
              <View style={styles.identityWrap}>
                <Text style={styles.userName}>{user.fullName}</Text>
                <Text style={styles.userMeta}>{user.email}</Text>
                <Text style={styles.userMeta}>Faculty: {user.faculty || 'Not set'} | Phone: {user.phoneNumber || 'Not set'}</Text>
                <Text style={styles.userMeta}>Posts: {user.itemCount || 0}</Text>
              </View>
              <View style={styles.metaPillRow}>
                <View style={[styles.metaPill, styles.rolePill]}>
                  <Text style={styles.rolePillText}>{String(user.role).toUpperCase()}</Text>
                </View>
                <View style={[styles.metaPill, user.isBlocked ? styles.blockedPill : styles.activePill]}>
                  <Text style={user.isBlocked ? styles.blockedPillText : styles.activePillText}>
                    {user.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                  </Text>
                </View>
              </View>
            </View>
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
            <Text style={adminStyles.cardSubtitle}>Update profile details and adjust account privileges when needed.</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  identityWrap: {
    flex: 1,
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
  rolePill: {
    backgroundColor: '#eef4fb',
  },
  rolePillText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '800',
  },
  activePill: {
    backgroundColor: '#ecfdf5',
  },
  activePillText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: '800',
  },
  blockedPill: {
    backgroundColor: '#fff1f2',
  },
  blockedPillText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '800',
  },
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
  },
});
