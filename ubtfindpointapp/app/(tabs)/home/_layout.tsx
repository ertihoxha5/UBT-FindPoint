import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeStackLayout() {
  const router = useRouter();

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
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/home/chat')}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#eff6ff',
              borderWidth: 1,
              borderColor: '#dbe7f3',
            }}>
            <IconSymbol size={20} name="bubble.left.and.bubble.right.fill" color="#2563eb" />
          </TouchableOpacity>
        ),
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ title: 'Report Details' }} />
      <Stack.Screen name="report" options={{ title: 'New Report' }} />
      <Stack.Screen name="chat/index" options={{ title: 'Chats' }} />
    </Stack>
  );
}
