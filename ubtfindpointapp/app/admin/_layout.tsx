import { Stack, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthViewModel } from '@/src/features/auth/viewmodel/AuthViewModel';

export default function AdminLayout() {
  const auth = useAuthViewModel();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    auth
      .getCurrentUser()
      .then((user) => {
        if (active) {
          setAllowed(Boolean(user && user.role === 'admin'));
        }
      })
      .catch(() => {
        if (active) {
          setAllowed(false);
        }
      });

    return () => {
      active = false;
    };
  }, [auth]);

  if (allowed === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf4f8' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!allowed) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="items" />
      <Stack.Screen name="reports" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
