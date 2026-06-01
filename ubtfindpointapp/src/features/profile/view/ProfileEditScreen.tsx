import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfileViewModel } from '../viewmodel/useProfileViewModel';
import { getAssetUrl } from '../../items/viewmodel/itemHelpers';

type SelectedPhoto = {
  uri: string;
  name: string;
  type: string;
} | null;

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, loading, saving, loadProfile, updateProfile } = useProfileViewModel();
  const [fullName, setFullName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto>(null);
  const [refreshingProfile, setRefreshingProfile] = useState(false);

  const hydrateForm = useCallback((user: any) => {
    setFullName(user?.fullName || '');
    setFaculty(user?.faculty || '');
    setPhoneNumber(user?.phoneNumber || '');
    setBio(user?.bio || '');
    setSelectedPhoto(null);
  }, []);

  const handleLoad = useCallback(async () => {
    try {
      setRefreshingProfile(true);
      const result = await loadProfile();
      hydrateForm(result.user);
    } catch {
      Alert.alert('Profile unavailable', 'Please try again.');
    } finally {
      setRefreshingProfile(false);
    }
  }, [hydrateForm, loadProfile]);

  useFocusEffect(
    useCallback(() => {
      void handleLoad();
    }, [handleLoad])
  );

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission denied', 'Photo access is needed to update your profile picture.');
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

      await updateProfile(formData);
      Alert.alert('Profile updated', 'Your profile details were saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Update failed', 'Please try again.');
    }
  };

  const avatarSource = selectedPhoto?.uri
    ? { uri: selectedPhoto.uri }
    : profile?.profilePictureUrl
      ? { uri: getAssetUrl(profile.profilePictureUrl) }
      : null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" backgroundColor="#f6f9fc" translucent={false} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient colors={['#1a3a5c', '#10233f']} style={styles.heroCard}>
          <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto} activeOpacity={0.88}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatar} />
            ) : (
              <LinearGradient colors={['#4a90e2', '#357abd']} style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {(profile?.fullName || 'U').slice(0, 1).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.title}>Update your profile</Text>
          <Text style={styles.subtitle}>Tap the photo or adjust your details below.</Text>
          {profile?.email ? <Text style={styles.email}>{profile.email}</Text> : null}
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={22} color="#4a90e2" />
            <Text style={styles.sectionTitle}>Edit Profile</Text>
          </View>

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

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.saveButton, (saving || loading || refreshingProfile) && styles.buttonDisabled]}
              onPress={onSave}
              activeOpacity={0.88}
              disabled={saving || loading || refreshingProfile}
            >
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

            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} activeOpacity={0.88}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7ff',
    paddingTop: 50, 
  },
  content: {
    padding: 16,
    paddingBottom: 108,
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
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: '#10233f',
    fontSize: 15,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveGradient: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#4a90e2',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
