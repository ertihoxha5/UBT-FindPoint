import { useCallback, useState } from 'react';
import { useAuthViewModel } from '../../auth/viewmodel/AuthViewModel';
import { fetchMyItems } from '../../items/viewmodel/itemViewModel';
import type { UserProfile } from '../../auth/model/UserProfileModel';
import type { Item } from '../../items/model/ItemModel';

export const useProfileViewModel = () => {
  const auth = useAuthViewModel();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await auth.getCurrentUser();

      if (!user) {
        setProfile(null);
        setPosts([]);
        return { user: null, userPosts: [] };
      }

      const userPosts = await fetchMyItems();
      setProfile(user);
      setPosts(userPosts);
      return { user, userPosts };
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load your profile.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const updateProfile = useCallback(async (payload: FormData) => {
    try {
      setSaving(true);
      setError(null);
      const updated = await auth.updateCurrentUser(payload);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update your profile.');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [auth]);

  const logout = useCallback(async () => {
    await auth.logout();
  }, [auth]);

  const deleteAccount = useCallback(async () => {
    await auth.deleteAccount();
  }, [auth]);

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
