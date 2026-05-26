import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthViewModel } from '../features/auth/viewmodel/AuthViewModel';

export default function ClientHeader() {
  const router = useRouter();
  const { user } = useAuthViewModel();

  const userName = user?.fullName || user?.name || user?.email || 'Guest';
  const firstName = userName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';

  return (
    <LinearGradient
      colors={['#ffffff', '#f8fafc']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.header}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={['#4a90e2', '#357abd']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.userTextContainer}>
              <Text style={styles.greetingText}>Good {greeting}</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {firstName}
              </Text>
            </View>
          </View>

          <View style={styles.centerLogo}>
            <Image source={require('@/assets/images/fp.png')} style={styles.smallLogo} resizeMode="contain" />
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/home/chat')}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#4a90e2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color="#4a90e2" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#51cf66',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: '#6c8db0',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a3a5c',
    marginTop: 2,
  },
  centerLogo: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  smallLogo: {
    width: 36,
    height: 36,
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
