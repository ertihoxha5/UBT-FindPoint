import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HomeCalendar from '../../calendar/components/HomeCalendar';
import type { Item } from '../../items/model/ItemModel';
import { fetchItems, fetchDashboardStats, type DashboardStats } from '../../items/viewmodel/itemViewModel';
import { formatRelativeItemDate, getAssetUrl } from '../../items/viewmodel/itemHelpers';
import { useAuthViewModel } from '../../auth/viewmodel/AuthViewModel';

const { width } = Dimensions.get('window');
const LOGO_SIZE = Math.min(width * 0.3, 120);
const CARD_WIDTH = width * 0.75;
type GradientPair = readonly [string, string];

// Color palettes for items without images
const COLOR_PALETTES = {
  lost: [
    ['#ff6b6b', '#ee5a52'],
    ['#ff8e53', '#ff6b6b'],
    ['#ff6b8b', '#ff4d6d'],
    ['#ff9a56', '#ff6b6b'],
  ],
  found: [
    ['#51cf66', '#40c057'],
    ['#69db7e', '#51cf66'],
    ['#94d82d', '#74c02e'],
    ['#66d980', '#40c057'],
  ],
  default: [
    ['#4a90e2', '#357abd'],
    ['#5c6bc0', '#3f51b5'],
    ['#7c4dff', '#651fff'],
    ['#00bcd4', '#0097a7'],
  ],
} satisfies Record<'lost' | 'found' | 'default', readonly GradientPair[]>;

const getRandomColor = (type: 'lost' | 'found'): GradientPair => {
  const palettes = type === 'lost' ? COLOR_PALETTES.lost : type === 'found' ? COLOR_PALETTES.found : COLOR_PALETTES.default;
  const randomIndex = Math.floor(Math.random() * palettes.length);
  return palettes[randomIndex];
};

// Get first letter of title for placeholder
const getTitleLetter = (title: string) => {
  return title.charAt(0).toUpperCase();
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthViewModel();
  const [recentLost, setRecentLost] = useState<Item[]>([]);
  const [recentFound, setRecentFound] = useState<Item[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollY] = useState(new Animated.Value(0));

  const userName = user?.fullName || user?.name || user?.email || 'Guest';
  const firstName = userName.split(' ')[0];

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [lost, found, dashboardStats] = await Promise.all([
        fetchItems({ type: 'lost', recent: true, limit: 5 }),
        fetchItems({ type: 'found', recent: true, limit: 5 }),
        fetchDashboardStats(),
      ]);

      setRecentLost(lost);
      setRecentFound(found);
      setStats(dashboardStats);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sections = useMemo<Section[]>(
    () => [
      {
        id: 'lost',
        title: 'Recently Lost',
        subtitle: 'Items people are searching for',
        route: '/items',
        routeLabel: 'See All',
        items: recentLost,
      },
      {
        id: 'found',
        title: 'Recently Found',
        subtitle: 'Items waiting to be reunited',
        route: '/items',
        routeLabel: 'See All',
        items: recentFound,
      },
    ],
    [recentFound, recentLost]
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [120, 70],
    extrapolate: 'clamp',
  });

  const logoScale = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 80],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  const openDetails = (item: Item) => {
    const imageUrl = item.media?.[0]?.url ? getAssetUrl(item.media[0].url) : '';
    router.push({
      pathname: '/home/details',
      params: {
        itemId: String(item.item_id),
        userId: String(item.user_id || ''),
        title: item.title,
        description: item.description || '',
        status: String(item.status),
        type: item.type,
        poster: item.poster_name || item.fullName || 'Unknown user',
        createdAt: item.created_at || '',
        imageUrl,
        category: item.category_name || '',
        categoryId: String(item.category_id),
        location: item.location_name || '',
        locationId: String(item.location_id),
        reward: item.reward || '',
        date: item.date ? String(item.date) : '',
        isAnonymous: item.is_anonymous ? 'true' : 'false',
      },
    });
  };

  const renderPostCard = (post: Item, index: number, isLast: boolean) => {
    const imageUrl = post.media?.[0]?.url ? getAssetUrl(post.media[0].url) : '';
    const hasImage = imageUrl && imageUrl !== '';
    const colors = getRandomColor(post.type);
    
    return (
      <TouchableOpacity
        key={String(post.item_id)}
        style={[styles.horizontalPostCard, index === 0 && styles.firstPostCard]}
        onPress={() => openDetails(post)}
        activeOpacity={0.9}
      >
        {hasImage ? (
          <Image source={{ uri: imageUrl }} style={styles.horizontalPostImage} />
        ) : (
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.horizontalPostImagePlaceholder}
          >
            <View style={styles.placeholderContent}>
              <View style={styles.placeholderIconCircle}>
                <Ionicons 
                  name={post.type === 'lost' ? 'alert-circle-outline' : 'checkmark-circle-outline'} 
                  size={40} 
                  color="#ffffff" 
                />
              </View>
              <Text style={styles.placeholderLetter}>
                {getTitleLetter(post.title)}
              </Text>
            </View>
          </LinearGradient>
        )}
        
        <View style={styles.horizontalPostContent}>
          <View style={[styles.horizontalPostBadge, post.type === 'lost' ? styles.lostBadge : styles.foundBadge]}>
            <Text style={[styles.horizontalPostBadgeText, post.type === 'lost' ? styles.lostText : styles.foundText]}>
              {post.type === 'lost' ? 'LOST' : 'FOUND'}
            </Text>
          </View>
          
          <Text style={styles.horizontalPostTitle} numberOfLines={2}>
            {post.title}
          </Text>
          
          <View style={styles.horizontalPostMeta}>
            <View style={styles.horizontalMetaItem}>
              <Ionicons name="folder-outline" size={12} color="#6c8db0" />
              <Text style={styles.horizontalMetaText}>{post.category_name || 'Uncategorized'}</Text>
            </View>
            <View style={styles.horizontalMetaItem}>
              <Ionicons name="location-outline" size={12} color="#6c8db0" />
              <Text style={styles.horizontalMetaText}>{post.location_name || 'Unknown'}</Text>
            </View>
          </View>
          
          <Text style={styles.horizontalPostTime}>{formatRelativeItemDate(post.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if ((loading || authLoading) && !stats) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.stateText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
      
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.headerSafeArea}>
            <View style={styles.headerContent}>
              <View style={styles.userSection}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.userTextContainer}>
                  <Text style={styles.greetingText}>
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                  </Text>
                  <Text style={styles.userName} numberOfLines={1}>
                    {firstName}
                  </Text>
                </View>
              </View>

              <Animated.View style={[styles.centerLogo, { opacity: headerOpacity }]}>
                <Image 
                  source={require('@/assets/images/fp.png')} 
                  style={styles.smallLogo} 
                  resizeMode="contain"
                />
              </Animated.View>

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
                  onPress={() => router.push('/profile')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="notifications-outline" size={22} color="#4a90e2" />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <Animated.FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#4a90e2" />}
        ListHeaderComponent={
          <View style={styles.content}>
            <Animated.View style={[styles.heroSection, { transform: [{ scale: logoScale }] }]}>
              <View style={styles.logoContainer}>
                <View style={styles.logoBackground}>
                  <LinearGradient
                    colors={['rgba(74, 144, 226, 0.1)', 'rgba(74, 144, 226, 0.05)']}
                    style={styles.glowEffect}
                  />
                  <Image 
                    source={require('@/assets/images/fp.png')} 
                    resizeMode="contain" 
                    style={styles.logo} 
                  />
                </View>
              </View>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.appName}>FindPoint</Text>
              <Text style={styles.tagline}>Find faster. Return sooner. Keep campus connected.</Text>
            </Animated.View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  style={styles.statGradient}
                >
                  <Ionicons name="cube-outline" size={28} color="#ffffff" />
                  <Text style={styles.statValue}>{stats?.totalItems || 0}</Text>
                  <Text style={styles.statLabel}>Total Items</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a52']}
                  style={styles.statGradient}
                >
                  <Ionicons name="alert-circle-outline" size={28} color="#ffffff" />
                  <Text style={styles.statValue}>{stats?.totalLost || 0}</Text>
                  <Text style={styles.statLabel}>Lost Items</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#51cf66', '#40c057']}
                  style={styles.statGradient}
                >
                  <Ionicons name="checkmark-circle-outline" size={28} color="#ffffff" />
                  <Text style={styles.statValue}>{stats?.totalFound || 0}</Text>
                  <Text style={styles.statLabel}>Found Items</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.secondaryStats}>
              <View style={styles.secondaryStatCard}>
                <Ionicons name="checkmark-done-circle" size={24} color="#4a90e2" />
                <View>
                  <Text style={styles.secondaryStatValue}>{stats?.resolvedItems || 0}</Text>
                  <Text style={styles.secondaryStatLabel}>Resolved</Text>
                </View>
              </View>
              
              <View style={styles.secondaryStatCard}>
                <Ionicons name="people" size={24} color="#51cf66" />
                <View>
                  <Text style={styles.secondaryStatValue}>{stats?.activeUsers || 0}</Text>
                  <Text style={styles.secondaryStatLabel}>Active Users</Text>
                </View>
              </View>
              
              <View style={styles.secondaryStatCard}>
                <Ionicons name="trending-up" size={24} color="#ff6b6b" />
                <View>
                  <Text style={styles.secondaryStatValue}>{stats?.recoveryRate || 0}%</Text>
                  <Text style={styles.secondaryStatLabel}>Recovery Rate</Text>
                </View>
              </View>
            </View>

            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push({ pathname: '/home/report', params: { type: 'lost' } })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a52']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="alert-circle-outline" size={22} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Report Lost</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push({ pathname: '/home/report', params: { type: 'found' } })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#51cf66', '#40c057']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle-outline" size={22} color="#ffffff" />
                  <Text style={styles.actionButtonText}>Report Found</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push({ pathname: item.route, params: { type: item.id } } as never)} activeOpacity={0.85}>
                <View style={styles.sectionLink}>
                  <Text style={styles.sectionLinkText}>{item.routeLabel}</Text>
                  <Ionicons name="arrow-forward" size={14} color="#4a90e2" />
                </View>
              </TouchableOpacity>
            </View>

            {item.items.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + 16}
                snapToAlignment="start"
              >
                {item.items.map((post, index) => renderPostCard(post, index, index === item.items.length - 1))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>No recent activity</Text>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerWrap}>
            <HomeCalendar />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  headerGradient: {
    flex: 1,
  },
  headerSafeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContent: {
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
    position: 'relative',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 140 : 120,
    paddingBottom: 20,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6c8db0',
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBackground: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: LOGO_SIZE + 20,
    height: LOGO_SIZE + 20,
    borderRadius: (LOGO_SIZE + 20) / 2,
  },
  logo: {
    width: LOGO_SIZE * 0.7,
    height: LOGO_SIZE * 0.7,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6c8db0',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginTop: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#6c8db0',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  statGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  secondaryStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4a90e2',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  secondaryStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  secondaryStatLabel: {
    fontSize: 10,
    color: '#6c8db0',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#ff6b6b',
    fontSize: 13,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6c8db0',
    marginTop: 2,
  },
  sectionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sectionLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a90e2',
  },
  horizontalScrollContent: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
  horizontalPostCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4a90e2',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  firstPostCard: {
    marginLeft: 0,
  },
  horizontalPostImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  horizontalPostImagePlaceholder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  placeholderLetter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  horizontalPostContent: {
    padding: 14,
  },
  horizontalPostBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  horizontalPostBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  horizontalPostTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a3a5c',
    marginBottom: 8,
    lineHeight: 22,
  },
  horizontalPostMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  horizontalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  horizontalMetaText: {
    fontSize: 11,
    color: '#6c8db0',
  },
  horizontalPostTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  lostBadge: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  foundBadge: {
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
  },
  lostText: {
    color: '#ff6b6b',
  },
  foundText: {
    color: '#51cf66',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
  },
  footerWrap: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});

// Add this type definition at the top
type Section = {
  id: string;
  title: string;
  subtitle: string;
  route: '/items';
  routeLabel: string;
  items: Item[];
};
