import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const navItems = [
  { label: 'Dashboard', route: '/admin', icon: 'grid-outline' },
  { label: 'Users', route: '/admin/users', icon: 'people-outline' },
  { label: 'Items', route: '/admin/items', icon: 'cube-outline' },
  { label: 'Notifications', route: '/admin/notifications', icon: 'notifications-outline' },
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
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <ScrollView
        contentContainerStyle={styles.content}
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
              <View style={styles.heroPill}>
                <Ionicons name="sparkles-outline" size={12} color="#dbeafe" />
                <Text style={styles.heroPillText}>Live admin overview</Text>
              </View>
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

        <View style={styles.childrenContainer}>
          {children}
        </View>
      </ScrollView>

      <View style={styles.bottomNavWrap}>
        <View style={[styles.bottomNav, isDark && styles.bottomNavDark]}>
          <View style={styles.bottomNavGlow} />
          {navItems.map((item) => {
            const active = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.bottomNavItem, active && styles.bottomNavItemActive]}
                onPress={() => router.replace(item.route as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.bottomNavIconWrap, active && styles.bottomNavIconWrapActive]}>
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={active ? '#ffffff' : isDark ? '#94a3b8' : '#6c8db0'}
                  />
                </View>
                <Text style={[styles.bottomNavText, active && styles.bottomNavTextActive, isDark && styles.bottomNavTextDark]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
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
    paddingTop: 8,
    paddingBottom: 120,
  },
  hero: {
    borderRadius: 30,
    padding: 28,
    marginHorizontal: 16,
    marginTop: 26,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    overflow: 'hidden',
  },
  heroGlowTop: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -70,
    right: -50,
    backgroundColor: 'rgba(255,255,255,0.11)',
  },
  heroGlowBottom: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: -60,
    left: -30,
    backgroundColor: 'rgba(96,165,250,0.22)',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
    marginBottom: 18,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: 10,
  },
  heroPillText: {
    color: '#dbeafe',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
    marginTop: 10,
    marginBottom: 8,
  },
  bottomNavWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  bottomNavDark: {
    backgroundColor: '#111827',
    borderColor: '#334155',
  },
  bottomNavGlow: {
    position: 'absolute',
    top: -24,
    right: -18,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bottomNavItemActive: {
    backgroundColor: 'rgba(74, 144, 226, 0.12)',
  },
  bottomNavIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef4fb',
  },
  bottomNavIconWrapActive: {
    backgroundColor: '#4a90e2',
  },
  bottomNavText: {
    color: '#6c8db0',
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  bottomNavTextDark: {
    color: '#94a3b8',
  },
  bottomNavTextActive: {
    color: '#0f5ee8',
  },
  childrenContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});
