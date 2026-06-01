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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ClientHeader from '@/src/components/ClientHeader';
import { useProfileViewModel } from '../viewmodel/useProfileViewModel';
import { formatItemDate, getAssetUrl } from '../../items/viewmodel/itemHelpers';
import { deleteMyItem, markMyItemFound } from '../../items/viewmodel/itemViewModel';

const { width } = Dimensions.get('window');

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
  const [showAllPosts, setShowAllPosts] = useState(false);

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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
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
      Alert.alert('Updated', 'The report was marked as found and updated immediately.');
    } catch {
      Alert.alert('Update failed', 'Please try again.');
    }
  };

  const stats = useMemo(() => {
    const lost = posts.filter((post) => post.type === 'lost').length;
    const found = posts.filter((post) => post.type === 'found').length;
    return [
      { label: 'Total posts', value: String(posts.length), icon: 'cube-outline', color: '#4a90e2' },
      { label: 'Lost posts', value: String(lost), icon: 'alert-circle-outline', color: '#ff6b6b' },
      { label: 'Found posts', value: String(found), icon: 'checkmark-circle-outline', color: '#51cf66' },
    ];
  }, [posts]);

  const profileRows = useMemo(
    () => [
      { label: 'Email', value: profile?.email || 'Not set', icon: 'mail-outline' },
      { label: 'Faculty', value: profile?.faculty || 'Not set', icon: 'school-outline' },
      { label: 'Phone', value: profile?.phoneNumber || 'Not set', icon: 'call-outline' },
      {
        label: 'Joined',
        value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown',
        icon: 'calendar-outline',
      },
    ],
    [profile]
  );

  const avatarSource = selectedPhoto?.uri
    ? { uri: selectedPhoto.uri }
    : profile?.profilePictureUrl
      ? { uri: getAssetUrl(profile.profilePictureUrl) }
      : null;

  // Get displayed posts (first 3 or all based on showAllPosts)
  const displayedPosts = showAllPosts ? posts : posts.slice(0, 3);
  const hasMorePosts = posts.length > 3;

  const renderPostItem = ({ item }: { item: any }) => {
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
        <View style={styles.postHeader}>
          <View style={[styles.postTypeBadge, item.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
            <Ionicons 
              name={item.type === 'lost' ? 'alert-circle-outline' : 'checkmark-circle-outline'} 
              size={14} 
              color={item.type === 'lost' ? '#ff6b6b' : '#51cf66'} 
            />
            <Text style={[styles.postType, item.type === 'lost' ? styles.lostText : styles.foundText]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.postStatusBadge, item.status === 'resolved' && styles.resolvedBadge]}>
            <Text style={[styles.postStatus, item.status === 'resolved' && styles.resolvedText]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDate}>{formatItemDate(item.created_at)}</Text>
        
        <View style={styles.postMeta}>
          <View style={styles.metaChip}>
            <Ionicons name="folder-outline" size={12} color="#6c8db0" />
            <Text style={styles.metaText}>{item.category_name || 'Uncategorized'}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="location-outline" size={12} color="#6c8db0" />
            <Text style={styles.metaText}>{item.location_name || 'Unknown'}</Text>
          </View>
        </View>

        <Text style={styles.postDescription} numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>

        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.postImage} />
        )}

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
            <Ionicons name="create-outline" size={16} color="#4a90e2" />
            <Text style={styles.postActionText}>Edit</Text>
          </TouchableOpacity>
          
          {item.status !== 'resolved' && (
            <TouchableOpacity style={styles.postActionButton} onPress={() => onMarkFound(item.item_id)} activeOpacity={0.88}>
              <Ionicons name="checkmark-done-outline" size={16} color="#51cf66" />
              <Text style={[styles.postActionText, { color: '#51cf66' }]}>Mark found</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.postDeleteButton} onPress={() => onDeletePost(item.item_id)} activeOpacity={0.88}>
            <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
            <Text style={styles.postDeleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
        <ClientHeader />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.stateText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
      <ClientHeader />
      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => String(item.item_id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => handleLoad(true)} tintColor="#4a90e2" />}
        ListHeaderComponent={
          <View>
            {/* Hero Section */}
            <LinearGradient
              colors={['#1a3a5c', '#10233f']}
              style={styles.heroCard}
            >
              <TouchableOpacity 
                style={styles.avatarWrap} 
                onPress={editingProfile ? pickPhoto : undefined} 
                activeOpacity={editingProfile ? 0.88 : 1}
              >
                {avatarSource ? (
                  <Image source={avatarSource} style={styles.avatar} />
                ) : (
                  <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    style={styles.avatarPlaceholder}
                  >
                    <Text style={styles.avatarPlaceholderText}>
                      {(profile?.fullName || 'U').slice(0, 1).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
                {editingProfile && (
                  <View style={styles.editAvatarBadge}>
                    <Ionicons name="camera" size={16} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.roleBadge}>
                <Text style={styles.role}>{profile?.role || 'user'}</Text>
              </View>
              <Text style={styles.name}>{profile?.fullName || 'User'}</Text>
              {bio ? <Text style={styles.bio}>{bio}</Text> : null}
              <Text style={styles.helperText}>
                {editingProfile ? 'Tap the image to update your profile photo.' : 'Your profile details and reports live here.'}
              </Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </LinearGradient>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {stats.map((stat) => (
                <View key={stat.label} style={styles.statCard}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Profile Information */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={22} color="#4a90e2" />
                <Text style={styles.sectionTitle}>Profile Information</Text>
              </View>
              
              {profileRows.map((row) => (
                <View key={row.label} style={styles.tableRow}>
                  <View style={styles.tableLabelContainer}>
                    <Ionicons name={row.icon as any} size={16} color="#6c8db0" />
                    <Text style={styles.tableLabel}>{row.label}</Text>
                  </View>
                  <Text style={styles.tableValue}>{row.value}</Text>
                </View>
              ))}
              
              {!editingProfile ? (
                <TouchableOpacity style={styles.primaryButton} onPress={() => setEditingProfile(true)} activeOpacity={0.88}>
                  <LinearGradient colors={['#4a90e2', '#357abd']} style={styles.buttonGradient}>
                    <Ionicons name="create-outline" size={20} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>Edit Profile</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.editProfileWrap}>
                  <Text style={styles.editTitle}>Edit Profile</Text>
                  
                  <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput 
                      value={fullName} 
                      onChangeText={setFullName} 
                      placeholder="Full name" 
                      placeholderTextColor="#94a3b8" 
                      style={styles.input} 
                    />
                  </View>
                  
                  <View style={styles.inputWrapper}>
                    <Ionicons name="school-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput 
                      value={faculty} 
                      onChangeText={setFaculty} 
                      placeholder="Faculty" 
                      placeholderTextColor="#94a3b8" 
                      style={styles.input} 
                    />
                  </View>
                  
                  <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput 
                      value={phoneNumber} 
                      onChangeText={setPhoneNumber} 
                      placeholder="Phone number" 
                      placeholderTextColor="#94a3b8" 
                      keyboardType="phone-pad"
                      style={styles.input} 
                    />
                  </View>
                  
                  <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                    <Ionicons name="chatbubble-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                    <TextInput
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Short bio"
                      placeholderTextColor="#94a3b8"
                      style={[styles.input, styles.textArea]}
                      multiline
                    />
                  </View>
                  
                  <View style={styles.editButtons}>
                    <TouchableOpacity style={[styles.saveButton, saving && styles.buttonDisabled]} onPress={onSave} activeOpacity={0.88} disabled={saving}>
                      <LinearGradient colors={['#51cf66', '#40c057']} style={styles.saveGradient}>
                        {saving ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <>
                            <Ionicons name="save-outline" size={20} color="#ffffff" />
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.cancelButton} onPress={onCancelEditProfile} activeOpacity={0.88}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* My Posts Section Header */}
            <View style={styles.postsHeader}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="document-text-outline" size={22} color="#4a90e2" />
                <Text style={styles.sectionTitle}>My Posts</Text>
                <Text style={styles.postCount}>{posts.length} total</Text>
              </View>
              
              {hasMorePosts && !showAllPosts && (
                <TouchableOpacity 
                  style={styles.showAllButton}
                  onPress={() => setShowAllPosts(true)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.1)', 'rgba(74, 144, 226, 0.05)']}
                    style={styles.showAllGradient}
                  >
                    <Text style={styles.showAllText}>Show All ({posts.length})</Text>
                    <Ionicons name="arrow-forward" size={16} color="#4a90e2" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {showAllPosts && (
                <TouchableOpacity 
                  style={styles.showLessButton}
                  onPress={() => setShowAllPosts(false)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="arrow-up" size={16} color="#4a90e2" />
                  <Text style={styles.showLessText}>Show Less</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        renderItem={renderPostItem}
        ListEmptyComponent={
          !posts.length ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>You haven't posted any lost or found items yet.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footerActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onLogout} activeOpacity={0.88}>
              <Ionicons name="log-out-outline" size={20} color="#4a90e2" />
              <Text style={styles.secondaryButtonText}>Log out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dangerButton} onPress={onDeleteAccount} activeOpacity={0.88}>
              <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
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
    backgroundColor: '#f0f7ff',
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
    color: '#6c8db0',
    fontSize: 15,
  },
  heroCard: {
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarWrap: {
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholderText: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '800',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#4a90e2',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  roleBadge: {
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  role: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  helperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    marginTop: 10,
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginTop: 8,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#6c8db0',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tableLabel: {
    color: '#6c8db0',
    fontSize: 13,
  },
  tableValue: {
    color: '#1a3a5c',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  editProfileWrap: {
    marginTop: 16,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a3a5c',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    gap: 10,
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6c8db0',
    fontSize: 15,
    fontWeight: '600',
  },
  postsHeader: {
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  postCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginLeft: 'auto',
  },
  showAllButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  showAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a90e2',
  },
  showLessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  showLessText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a90e2',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lostBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  foundBadge: {
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
  },
  postType: {
    fontSize: 11,
    fontWeight: '700',
  },
  lostText: {
    color: '#ff6b6b',
  },
  foundText: {
    color: '#51cf66',
  },
  postStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  resolvedBadge: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  postStatus: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6c8db0',
  },
  resolvedText: {
    color: '#4a90e2',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a3a5c',
    marginBottom: 4,
  },
  postDate: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6c8db0',
  },
  postDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  postActions: {
    flexDirection: 'row',
    gap: 10,
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a90e2',
  },
  postDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  postDeleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 8,
  },
  footerActions: {
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#4a90e2',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  dangerButtonText: {
    color: '#ff6b6b',
    fontSize: 15,
    fontWeight: '600',
  },
});
