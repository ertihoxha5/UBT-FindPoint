import { Stack } from 'expo-router';

export default function HomeStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ title: 'Report Details' }} />
      <Stack.Screen name="report" options={{ title: 'New Report' }} />
    </Stack>
  );
}
