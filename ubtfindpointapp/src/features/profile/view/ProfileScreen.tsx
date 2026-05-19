import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useProfileViewModel } from '../viewmodel/useProfileViewModel';
import { formatItemDate, getAssetUrl } from '../../items/viewmodel/itemHelpers';
import { deleteMyItem, markMyItemFound } from '../../items/viewmodel/itemViewModel';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, posts, loading, saving, error, loadProfile, updateProfile, logout, deleteAccount } = useProfileViewModel();
  const [refreshing, setRefreshing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  const hydrateForm = useCallback((user: any) => {
    setFullName(user?.fullName || '');
    setFaculty(user?.faculty || '');
    setPhoneNumber(user?.phoneNumber || '');
    setBio(user?.bio || '');
  }, []);

  const handleLoad = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      const result = await loadProfile();
      hydrateForm(result.user);
    } finally {
      setRefreshing(false);
    }
  }, [hydrateForm, loadProfile]);

  useEffect(() => {
    handleLoad();
  }, [handleLoad]);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission denied', 'Photo access is needed to set a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];
    setSelectedPhoto({
      uri: asset.uri,
      name: asset.fileName || `profile-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const onSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Missing name', 'Please enter your full name.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('faculty', faculty.trim());
      formData.append('phoneNumber', phoneNumber.trim());
      formData.append('bio', bio.trim());

      if (selectedPhoto) {
        formData.append('profilePhoto', selectedPhoto as any);
      }

      const updated = await updateProfile(formData);
      hydrateForm(updated);
      setSelectedPhoto(null);
      setEditingProfile(false);
      Alert.alert('Profile updated', 'Your profile details were saved.');
    } catch {
      Alert.alert('Update failed', 'Please try again.');
    }
  };

  const onCancelEditProfile = () => {
    hydrateForm(profile);
    setSelectedPhoto(null);
    setEditingProfile(false);
  };

  const onLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const onDeleteAccount = async () => {
    Alert.alert('Delete account', 'This will remove your account and posts permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount();
            router.replace('/login');
          } catch {
            Alert.alert('Delete failed', 'Please try again.');
          }
        },
      },
    ]);
  };

  const onDeletePost = (itemId: number) => {
    Alert.alert('Delete report', 'This report will be removed permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMyItem(itemId);
            await handleLoad();
          } catch {
            Alert.alert('Delete failed', 'Please try again.');
          }
        },
      },
    ]);
  };

  const onMarkFound = async (itemId: number) => {
    try {
      await markMyItemFound(itemId);
      await handleLoad();
      Alert.alert('Updated', 'The report has been marked as found.');
    } catch {
      Alert.alert('Update failed', 'Please try again.');
    }
  };

  const stats = useMemo(() => {
    const lost = posts.filter((post) => post.type === 'lost').length;
    const found = posts.filter((post) => post.type === 'found').length;
    return [
      { label: 'Total posts', value: String(posts.length) },
      { label: 'Lost posts', value: String(lost) },
      { label: 'Found posts', value: String(found) },
    ];
  }, [posts]);

  const profileRows = useMemo(
    () => [
      { label: 'Email', value: profile?.email || 'Not set' },
      { label: 'Faculty', value: profile?.faculty || 'Not set' },
      { label: 'Phone', value: profile?.phoneNumber || 'Not set' },
      {
        label: 'Joined',
        value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown',
      },
    ],
    [profile]
  );

  const avatarSource = selectedPhoto?.uri
    ? { uri: selectedPhoto.uri }
    : profile?.profilePictureUrl
      ? { uri: getAssetUrl(profile.profilePictureUrl) }
      : null;

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.stateText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.item_id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => handleLoad(true)} tintColor="#2563eb" />}
        ListHeaderComponent={
          <View>
            <View style={styles.heroCard}>
              <TouchableOpacity style={styles.avatarWrap} onPress={editingProfile ? pickPhoto : undefined} activeOpacity={editingProfile ? 0.88 : 1}>
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>{(profile?.fullName || 'U').slice(0, 1).toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.roleBadge}>
                <Text style={styles.role}>{profile?.role || 'user'}</Text>
              </View>
              <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
              <Text style={styles.helperText}>
                {editingProfile ? 'Tap the image to update your profile photo.' : 'Your profile details and reports live here.'}
              </Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Profile information</Text>
              {profileRows.map((row) => (
                <View key={row.label} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{row.label}</Text>
                  <Text style={styles.tableValue}>{row.value}</Text>
                </View>
              ))}
              {!editingProfile ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => setEditingProfile(true)} activeOpacity={0.88}>
                  <Text style={styles.primaryButtonText}>Edit profile</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.editProfileWrap}>
                  <Text style={styles.sectionTitle}>Edit profile</Text>
                  <TextInput value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor="#94a3b8" style={styles.input} />
                  <TextInput value={faculty} onChangeText={setFaculty} placeholder="Faculty" placeholderTextColor="#94a3b8" style={styles.input} />
                  <TextInput value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone number" placeholderTextColor="#94a3b8" style={styles.input} />
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Short bio"
                    placeholderTextColor="#94a3b8"
                    style={[styles.input, styles.textArea]}
                    multiline
                  />
                  <TouchableOpacity style={[styles.primaryButton, saving && styles.buttonDisabled]} onPress={onSave} activeOpacity={0.88} disabled={saving}>
                    <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save profile'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryInlineButton} onPress={onCancelEditProfile} activeOpacity={0.88}>
                    <Text style={styles.secondaryInlineButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My posts</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl = item.media?.[0]?.url ? getAssetUrl(item.media[0].url) : '';
          return (
            <TouchableOpacity
              style={styles.postCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/home/details',
                  params: {
                    itemId: String(item.item_id),
                    userId: String(item.user_id || profile?.userId || ''),
                    title: item.title,
                    description: item.description || '',
                    status: String(item.status),
                    type: item.type,
                    poster: item.poster_name || profile?.fullName || 'You',
                    createdAt: item.created_at || '',
                    imageUrl,
                    category: item.category_name || '',
                    categoryId: String(item.category_id),
                    location: item.location_name || '',
                    locationId: String(item.location_id),
                    reward: item.reward || '',
                    date: item.date ? String(item.date) : '',
                    isAnonymous: item.is_anonymous ? 'true' : 'false',
                    isOwner: 'true',
                  },
                })
              }
            >
              <View style={styles.postMeta}>
                <Text style={styles.postType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.postDate}>{formatItemDate(item.created_at)}</Text>
              </View>
              <Text style={styles.postStatus}>{String(item.status).toUpperCase()}</Text>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postDetails}>{(item.category_name || 'Uncategorized')} | {(item.location_name || 'Unknown place')}</Text>
              <Text style={styles.postDescription}>{item.description || 'No description provided.'}</Text>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.postImage} /> : null}
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.postActionButton}
                  onPress={() =>
                    router.push({
                      pathname: '/home/report',
                      params: {
                        itemId: String(item.item_id),
                        title: item.title,
                        description: item.description || '',
                        type: item.type,
                        categoryId: String(item.category_id),
                        locationId: String(item.location_id),
                        reward: item.reward || '',
                        date: item.date ? String(item.date) : '',
                        isAnonymous: item.is_anonymous ? 'true' : 'false',
                      },
                    })
                  }
                  activeOpacity={0.88}
                >
                  <Text style={styles.postActionText}>Edit</Text>
                </TouchableOpacity>
                {item.status !== 'resolved' ? (
                  <TouchableOpacity style={styles.postActionButton} onPress={() => onMarkFound(item.item_id)} activeOpacity={0.88}>
                    <Text style={styles.postActionText}>Mark as found</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.postDeleteButton} onPress={() => onDeletePost(item.item_id)} activeOpacity={0.88}>
                  <Text style={styles.postDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>You have not posted any lost or found items yet.</Text>}
        ListFooterComponent={
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onLogout} activeOpacity={0.88}>
              <Text style={styles.secondaryButtonText}>Log out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerButton} onPress={onDeleteAccount} activeOpacity={0.88}>
              <Text style={styles.dangerButtonText}>Delete account</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf4f8',
  },
  content: {
    padding: 16,
    paddingBottom: 108,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    color: '#526175',
    fontSize: 15,
  },
  heroCard: {
    backgroundColor: '#10233f',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatar: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#dbe7f3',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  avatarPlaceholder: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  avatarPlaceholderText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  roleBadge: {
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  role: {
    fontSize: 12,
    fontWeight: '800',
    color: '#dbeafe',
    textTransform: 'uppercase',
  },
  helperText: {
    marginTop: 10,
    fontSize: 14,
    color: '#d8e6f5',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10233f',
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#526175',
  },
  sectionCard: {
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#10233f',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
  },
  tableLabel: {
    flex: 1,
    color: '#526175',
    fontSize: 13,
    fontWeight: '700',
  },
  tableValue: {
    flex: 1,
    textAlign: 'right',
    color: '#10233f',
    fontSize: 14,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#f7fbff',
    marginBottom: 12,
    color: '#10233f',
    fontSize: 15,
  },
  textArea: {
    height: 110,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  primaryButton: {
    marginTop: 12,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginTop: 14,
    marginBottom: 2,
  },
  editProfileWrap: {
    marginTop: 14,
  },
  secondaryInlineButton: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#eef4fb',
  },
  secondaryInlineButtonText: {
    color: '#1e40af',
    fontSize: 15,
    fontWeight: '700',
  },
  postCard: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  postType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
  },
  postDate: {
    fontSize: 12,
    color: '#6b7b91',
  },
  postStatus: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  postTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
  },
  postDetails: {
    marginTop: 6,
    fontSize: 13,
    color: '#1d4ed8',
  },
  postDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#526175',
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: '#dbe7f3',
  },
  postActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  postActionButton: {
    backgroundColor: '#eef4fb',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postActionText: {
    color: '#1e40af',
    fontSize: 13,
    fontWeight: '700',
  },
  postDeleteButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  postDeleteText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#526175',
  },
  footerActions: {
    gap: 12,
    marginTop: 18,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '700',
  },
});
