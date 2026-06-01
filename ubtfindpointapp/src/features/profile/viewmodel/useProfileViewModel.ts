import { useCallback, useState } from 'react';
import { useAuthViewModel } from '../../auth/viewmodel/AuthViewModel';
import { fetchMyItems } from '../../items/viewmodel/itemViewModel';
import type { UserProfile } from '../../auth/model/UserProfileModel';
import type { Item } from '../../items/model/ItemModel';

type AuthUserProfile = Partial<UserProfile> & {
  id?: number;
  name?: string;
  created_at?: string;
  profile_picture_url?: string;
  profilePicture?: string;
};

const toUserProfile = (user: AuthUserProfile): UserProfile => ({
  userId: Number(user.userId ?? user.id ?? 0),
  fullName: user.fullName ?? user.name ?? '',
  email: user.email ?? '',
  role: user.role ?? 'user',
  faculty: user.faculty ?? '',
  phoneNumber: user.phoneNumber ?? '',
  bio: user.bio ?? '',
  profilePictureUrl: user.profilePictureUrl ?? user.profile_picture_url ?? user.profilePicture ?? '',
  createdAt: user.createdAt ?? user.created_at,
  lastLogin: user.lastLogin ?? null,
  isActive: user.isActive ?? true,
  isBlocked: user.isBlocked,
  profileUpdatedAt: user.profileUpdatedAt ?? null,
});

export const useProfileViewModel = () => {
  const { getCurrentUser, updateCurrentUser, logout: authLogout, deleteAccount: authDeleteAccount } = useAuthViewModel();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await getCurrentUser();

      if (!user) {
        setProfile(null);
        setPosts([]);
        return { user: null, userPosts: [] };
      }

      const userPosts = await fetchMyItems();
      const userProfile = toUserProfile(user);
      setProfile(userProfile);
      setPosts(userPosts);
      return { user: userProfile, userPosts };
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load your profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCurrentUser]);

  const updateProfile = useCallback(async (payload: FormData) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await updateCurrentUser(payload);
      const updatedProfile = toUserProfile(updated);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update your profile.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [updateCurrentUser]);

  const logout = useCallback(async () => {
    await authLogout();
  }, [authLogout]);

  const deleteAccount = useCallback(async () => {
    await authDeleteAccount();
  }, [authDeleteAccount]);

  return {
    profile,
    posts,
    loading,
    saving,
    error,
    loadProfile,
    updateProfile,
    logout,
    deleteAccount,
  };
};
