import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Platform, View, Text } from 'react-native';
// import { BlurView } from 'expo-blur';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { fetchNotifications } from '@/src/services/notifications';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';
  
  // Modern blue theme colors
  const primaryColor = '#4a90e2';
  const primaryLight = 'rgba(74, 144, 226, 0.1)';
  const primaryDark = '#1a3a5c';
  
  const backgroundColor = isDark ? '#0a1929' : '#f0f7ff';
  const headerBg = isDark ? '#132f4c' : '#ffffff';
  const cardBg = isDark ? '#1e3a5f' : '#ffffff';
  const textColor = isDark ? '#e3f2fd' : '#1a3a5c';
  const inactiveColor = isDark ? '#7b9fc7' : '#8ba9c9';
  const borderColor = isDark ? '#2a4a6e' : '#dce7f5';
  const tabBg = isDark ? 'rgba(19, 47, 76, 0.95)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: true,
        tabBarButton: HapticTab,
        headerStyle: {
          backgroundColor: headerBg,
          borderBottomWidth: 0,
          shadowColor: primaryColor,
          shadowOpacity: 0.08,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: primaryDark,
          fontSize: 20,
          fontWeight: '700',
          letterSpacing: -0.3,
        },
        headerTintColor: primaryColor,
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 16,
          height: 65,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 12,
          borderRadius: 32,
          backgroundColor: tabBg,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: borderColor,
          shadowColor: primaryColor,
          shadowOpacity: 0.1,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
          backdropFilter: Platform.OS === 'ios' ? 'blur(20px)' : undefined,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          borderRadius: 24,
          marginHorizontal: 4,
        },
        headerRight: () => {
          const [unread, setUnread] = React.useState(0);

          React.useEffect(() => {
            let mounted = true;
            const load = async () => {
              try {
                const data = await fetchNotifications();
                if (!mounted) return;
                setUnread(Number(data.unreadCount || 0));
              } catch (e) {
                // ignore
              }
            };

            void load();
            const id = setInterval(load, 30000);
            return () => { mounted = false; clearInterval(id); };
          }, []);

          return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('/notifications')}
                activeOpacity={0.8}
                style={{
                  marginRight: 12,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: primaryLight,
                  borderWidth: 1,
                  borderColor: borderColor,
                  shadowColor: primaryColor,
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                }}>
                <IconSymbol size={22} name="bell.fill" color={primaryColor} />
                {unread > 0 && (
                  <View style={{ position: 'absolute', top: 6, right: 8, backgroundColor: '#ff3b30', minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{unread > 99 ? '99+' : String(unread)}</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/home/chat')}
                activeOpacity={0.8}
                style={{
                  marginRight: 20,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: primaryLight,
                  borderWidth: 1,
                  borderColor: borderColor,
                  shadowColor: primaryColor,
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                }}>
                <IconSymbol 
                  size={22} 
                  name="bubble.left.and.bubble.right.fill" 
                  color={primaryColor} 
                />
              </TouchableOpacity>
            </View>
          );
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol 
                size={focused ? 28 : 24} 
                name="house.fill" 
                color={color} 
              />
              {focused && (
                <View style={{
                  position: 'absolute',
                  bottom: -8,
                  width: 20,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: primaryColor,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="items/index"
        options={{
          title: 'Items',
          headerShown: false,
          tabBarLabel: 'Items',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol 
                size={focused ? 28 : 24} 
                name="tray.full.fill" 
                color={color} 
              />
              {focused && (
                <View style={{
                  position: 'absolute',
                  bottom: -8,
                  width: 20,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: primaryColor,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="lostItems/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="foundItems/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol 
                size={focused ? 28 : 24} 
                name="person.crop.circle.fill" 
                color={color} 
              />
              {focused && (
                <View style={{
                  position: 'absolute',
                  bottom: -8,
                  width: 20,
                  height: 3,
                  borderRadius: 1.5,
                  backgroundColor: primaryColor,
                }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerShown: false,
          href: null,
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
