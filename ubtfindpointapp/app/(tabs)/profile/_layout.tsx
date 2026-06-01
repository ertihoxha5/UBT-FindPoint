import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f6f9fc',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: '#10233f',
          fontSize: 18,
          fontWeight: '800',
        },
        headerTintColor: '#4a90e2',
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ headerShown: false }} />
    </Stack>
  );
}