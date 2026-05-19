import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

const navItems = [
  { label: 'Dashboard', route: '/admin' },
  { label: 'Users', route: '/admin/users' },
  { label: 'Items', route: '/admin/items' },
];

export default function AdminShell({
  title,
  subtitle,
  activeRoute,
  children,
  rightAction,
  onLogout,
}: {
  title: string;
  subtitle: string;
  activeRoute: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  onLogout?: () => void;
}) {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <ScrollView contentContainerStyle={styles.content} style={[styles.screen, isDark && styles.screenDark]} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, isDark && styles.heroDark]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>Admin Panel</Text>
          <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
          
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{subtitle}</Text>
        </View>
        <View style={styles.heroActions}>
          {rightAction}
          {onLogout ? (
            <TouchableOpacity
              style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
              onPress={onLogout}
              activeOpacity={0.88}
            >
              <Text style={[styles.logoutButtonText, isDark && styles.logoutButtonTextDark]}>Logout</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navRow}>
        {navItems.map((item) => {
          const active = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navChip, active && styles.navChipActive]}
              onPress={() => router.replace(item.route as any)}
              activeOpacity={0.88}>
              <Text style={[styles.navChipText, active && styles.navChipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {children}
    </ScrollView>
  );
}

export const adminStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    marginBottom: 14,
  },
  cardTitle: {
    color: '#10233f',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  cardTitleDark: {
    color: '#f1f5f9',
  },
  cardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#f7fbff',
    color: '#10233f',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#eef4fb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 14,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf4f8',
  },
  screenDark: {
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
    paddingTop: 48,
  },
  hero: {
    backgroundColor: '#10233f',
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  heroDark: {
    backgroundColor: '#111827',
  },
  eyebrow: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  eyebrowDark: {
    color: '#cbd5e1',
  },
  title: {
    color: '#ffffff',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 10,
  },
  titleDark: {
    color: '#f8fafc',
  },
  subtitle: {
    color: '#d8e6f5',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  subtitleDark: {
    color: '#cbd5e1',
  },
  heroActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonDark: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.25)',
  },
  logoutButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutButtonTextDark: {
    color: '#fecaca',
  },
  navRow: {
    gap: 10,
    paddingRight: 8,
    marginBottom: 14,
  },
  navChip: {
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  navChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  navChipText: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: 13,
  },
  navChipTextActive: {
    color: '#ffffff',
  },
});
