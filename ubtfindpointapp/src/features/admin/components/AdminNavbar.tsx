import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface AdminNavbarProps {
  activeRoute: string;
  onLogout: () => void;
}

export function AdminNavbar({ activeRoute, onLogout }: AdminNavbarProps) {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const navItems = [
    { label: 'Dashboard', route: '/admin', icon: 'grid-outline' },
    { label: 'Users', route: '/admin/users', icon: 'people-outline' },
    { label: 'Items', route: '/admin/items', icon: 'cube-outline' },
    { label: 'Reports', route: '/admin/reports', icon: 'flag-outline' },
    { label: 'Notifications', route: '/admin/notifications', icon: 'notifications-outline' },
  ];

  return (
    <View style={[styles.navbar, isDark && styles.navbarDark]}>
      <View style={styles.navContent}>
        <View style={styles.navLeft}>
          <Text style={[styles.navBrand, isDark && styles.navBrandDark]}>UBT Admin</Text>
          <View style={styles.navDivider} />
          <View style={styles.navLinks}>
            {navItems.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[
                    styles.navLink,
                    isActive && [styles.navLinkActive, isDark && styles.navLinkActiveDark],
                  ]}
                  onPress={() => router.replace(item.route as any)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={isActive ? (isDark ? '#ffffff' : '#0f5ee8') : isDark ? '#94a3b8' : '#64748b'}
                  />
                  <Text
                    style={[
                      styles.navLinkText,
                      isActive && [styles.navLinkTextActive, isDark && styles.navLinkTextActiveDark],
                      isDark && styles.navLinkTextDark,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Text style={[styles.logoutButtonText, isDark && styles.logoutButtonTextDark]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  navbarDark: {
    backgroundColor: '#1e293b',
    borderBottomColor: '#334155',
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navBrand: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f5ee8',
    letterSpacing: 0.5,
  },
  navBrandDark: {
    color: '#60a5fa',
  },
  navDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  navLinks: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  navLink: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navLinkActive: {
    backgroundColor: '#eff6ff',
  },
  navLinkActiveDark: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  navLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  navLinkTextActive: {
    color: '#0f5ee8',
  },
  navLinkTextActiveDark: {
    color: '#60a5fa',
  },
  navLinkTextDark: {
    color: '#94a3b8',
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 0.3,
  },
  logoutButtonTextDark: {
    color: '#fca5a5',
  },
});
