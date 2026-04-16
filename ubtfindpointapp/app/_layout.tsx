import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, SplashScreen, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const isAuthScreen = segments[0] === 'login' || segments[0] === 'register';

  useEffect(() => {
    async function prepare() {
      try {
        // Këtu mund të ngarkosh fonte, auth, ose çfarëdo gjë tjetër
        // await Font.loadAsync(...);

        // Delay për të parë splash-in më mirë (mund ta ulësh më vonë)
        await new Promise(resolve => setTimeout(resolve, 1800));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayout = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;   
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        {!isAuthScreen ? <StatusBar style="auto" /> : null}
      </ThemeProvider>
    </View>
  );
}