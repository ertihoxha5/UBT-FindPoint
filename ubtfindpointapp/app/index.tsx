import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthViewModel } from '@/src/features/auth/viewmodel/AuthViewModel';

export default function Index() {
  const auth = useAuthViewModel();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    auth
      .hasSession()
      .then(async (hasSession) => {
        if (!active) return;
        if (!hasSession) {
          setTarget('/login');
          return;
        }

        try {
          const user = await auth.getCurrentUser();
          if (active) {
            setTarget(user.role === 'admin' ? '/admin' : '/home');
          }
        } catch {
          if (active) {
            setTarget('/login');
          }
        }
      })
      .catch(() => {
        if (active) {
          setTarget('/login');
        }
      });

    return () => {
      active = false;
    };
  }, [auth]);

  if (!target) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#edf4f8' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Redirect href={target as any} />;
}
