import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const navItems = [
  { label: 'Dashboard', route: '/admin', icon: 'grid-outline' },
  { label: 'Users', route: '/admin/users', icon: 'people-outline' },
  { label: 'Items', route: '/admin/items', icon: 'cube-outline' },
  { label: 'Reports', route: '/admin/reports', icon: 'flag-outline' },
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
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, isDark && styles.screenDark]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={isDark ? ['#111827', '#0f172a', '#172554'] : ['#112f52', '#123e70', '#2563eb']}
        style={styles.hero}
      >
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark-outline" size={32} color="#4a90e2" />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>Admin Control Center</Text>
            <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.heroActions}>
          {rightAction}
          {onLogout && (
            <TouchableOpacity
              style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
              onPress={onLogout}
              activeOpacity={0.85}
            >
              <Ionicons name="log-out-outline" size={18} color="#ff6b6b" />
              <Text style={[styles.logoutButtonText, isDark && styles.logoutButtonTextDark]}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <View style={styles.navWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navRow}
        >
          {navItems.map((item) => {
            const active = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.navChip, active && styles.navChipActive, isDark && styles.navChipDark]}
                onPress={() => router.replace(item.route as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={active ? ['#4a90e2', '#357abd'] : [isDark ? '#1e293b' : '#ffffff', isDark ? '#0f172a' : '#f8fbff']}
                  style={[styles.navChipGradient, active && styles.navChipGradientActive]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={active ? '#ffffff' : isDark ? '#94a3b8' : '#6c8db0'}
                  />
                  <Text style={[styles.navChipText, active && styles.navChipTextActive, isDark && styles.navChipTextDark]}>
                    {item.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.childrenContainer}>
        {children}
      </View>
    </ScrollView>
  );
}

export const adminStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#1a3a5c',
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
  cardSubtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    color: '#1a3a5c',
    fontSize: 15,
  },
  inputDark: {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    color: '#f1f5f9',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#eef4fb',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#4a90e2',
    fontWeight: '700',
    fontSize: 14,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  dangerButtonText: {
    color: '#ff6b6b',
    fontWeight: '700',
    fontSize: 14,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c8db0',
    marginTop: 4,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#eef4fb',
  },
  badgeText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '800',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6c8db0',
    textTransform: 'uppercase',
  },
  tableCellText: {
    fontSize: 14,
    color: '#1a3a5c',
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  screenDark: {
    backgroundColor: '#0f172a',
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    borderRadius: 28,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -60,
    right: -40,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: -50,
    left: -20,
    backgroundColor: 'rgba(96,165,250,0.20)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(74, 144, 226, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  eyebrow: {
    color: '#4a90e2',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  eyebrowDark: {
    color: '#60a5fa',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  titleDark: {
    color: '#f8fafc',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
  },
  subtitleDark: {
    color: '#94a3b8',
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  logoutButtonDark: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderColor: 'rgba(248, 113, 113, 0.25)',
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutButtonTextDark: {
    color: '#fca5a5',
  },
  navWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  navRow: {
    gap: 10,
    paddingRight: 8,
  },
  navChip: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    backgroundColor: '#ffffff',
  },
  navChipDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  navChipActive: {
    borderColor: '#4a90e2',
  },
  navChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  navChipGradientActive: {
    backgroundColor: '#4a90e2',
  },
  navChipText: {
    color: '#6c8db0',
    fontWeight: '600',
    fontSize: 14,
  },
  navChipTextDark: {
    color: '#94a3b8',
  },
  navChipTextActive: {
    color: '#ffffff',
  },
  childrenContainer: {
    paddingHorizontal: 16,
  },
});
