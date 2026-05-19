import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  // Modern color palette
  const primaryColor = isDark ? '#60a5fa' : '#0f5ee8';
  const backgroundColor = isDark ? '#0f172a' : '#f8fafc';
  const headerBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const inactiveColor = isDark ? '#64748b' : '#94a3b8';
  const borderColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: textColor,
          fontSize: 18,
          fontWeight: '800',
          letterSpacing: -0.5,
        },
        headerTintColor: textColor,
        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 0,
          height: 68,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 18 : 8,
          borderRadius: 20,
          backgroundColor: headerBg,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: borderColor,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.3,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/home/chat')}
            style={{
              marginRight: 16,
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark 
                ? 'rgba(96, 165, 250, 0.1)' 
                : 'rgba(15, 94, 232, 0.08)',
              borderWidth: 1.5,
              borderColor: isDark
                ? 'rgba(96, 165, 250, 0.2)'
                : 'rgba(15, 94, 232, 0.15)',
            }}>
            <IconSymbol 
              size={20} 
              name="bubble.left.and.bubble.right.fill" 
              color={primaryColor} 
            />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lostItems/index"
        options={{
          title: 'Lost Items',
          tabBarLabel: 'Lost',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={26} 
              name="exclamationmark.triangle.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="foundItems/index"
        options={{
          title: 'Found Items',
          tabBarLabel: 'Found',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={26} 
              name="checkmark.seal.fill" 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={26} 
              name="person.crop.circle.fill" 
              color={color} 
            />
          ),
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
