import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: '#7c8ca3',
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: '#f6f9fc',
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: '#10233f',
          fontSize: 18,
          fontWeight: '800',
        },
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 14,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
          borderRadius: 24,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          shadowColor: '#0f172a',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
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
            <IconSymbol size={20} name="bubble.left.and.bubble.right.fill" color={tint} />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lostItems/index"
        options={{
          title: 'Lost Items',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="exclamationmark.triangle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="foundItems/index"
        options={{
          title: 'Found Items',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.seal.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="addItems/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
