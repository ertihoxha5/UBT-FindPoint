import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
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

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, posts, loading, saving, error, loadProfile, updateProfile, logout, deleteAccount } = useProfileViewModel();
  const [refreshing, setRefreshing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<{ uri: string; name: string; type: string } | null>(null);

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
      Alert.alert('Profile updated', 'Your profile details were saved.');
    } catch {
      Alert.alert('Update failed', 'Please try again.');
    }
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
          <ScrollView scrollEnabled={false}>
            <View style={styles.heroCard}>
              <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto} activeOpacity={0.88}>
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>{(profile?.fullName || 'U').slice(0, 1).toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
              <Text style={styles.role}>{profile?.role || 'user'}</Text>
              <Text style={styles.helperText}>Tap the image to update your profile photo.</Text>
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
            </View>

            <View style={styles.sectionCard}>
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
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>My posts</Text>
            </View>
          </ScrollView>
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
                    title: item.title,
                    description: item.description || '',
                    status: String(item.status),
                    type: item.type,
                    poster: item.poster_name || profile?.fullName || 'You',
                    createdAt: item.created_at || '',
                    imageUrl,
                    category: item.category_name || '',
                    location: item.location_name || '',
                    reward: item.reward || '',
                  },
                })
              }
            >
              <View style={styles.postMeta}>
                <Text style={styles.postType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.postDate}>{formatItemDate(item.created_at)}</Text>
              </View>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postDetails}>{(item.category_name || 'Uncategorized')} | {(item.location_name || 'Unknown place')}</Text>
              <Text style={styles.postDescription}>{item.description || 'No description provided.'}</Text>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.postImage} /> : null}
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
    backgroundColor: '#f4f8fc',
  },
  content: {
    padding: 16,
    paddingBottom: 28,
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
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  avatarWrap: {
    marginBottom: 12,
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#dbe7f3',
  },
  avatarPlaceholder: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10233f',
  },
  role: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
    textTransform: 'uppercase',
  },
  helperText: {
    marginTop: 10,
    fontSize: 14,
    color: '#526175',
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
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7f3',
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
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
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
    height: 50,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#f8fbff',
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
    height: 50,
    borderRadius: 14,
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
  postCard: {
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
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
    borderRadius: 14,
    marginTop: 12,
    backgroundColor: '#dbe7f3',
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
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '700',
  },
});
