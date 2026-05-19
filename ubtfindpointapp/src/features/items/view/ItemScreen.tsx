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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import HomeCalendar from '@/src/features/calendar/components/HomeCalendar';
import type { Item } from '../model/ItemModel';
import { fetchItems } from '../viewmodel/itemViewModel';
import { formatRelativeItemDate, getAssetUrl } from '../viewmodel/itemHelpers';

type Section = {
  id: string;
  title: string;
  subtitle: string;
  route: '/lostItems' | '/foundItems';
  routeLabel: string;
  items: Item[];
};

export default function ItemScreen() {
  const router = useRouter();
  const [recentLost, setRecentLost] = useState<Item[]>([]);
  const [recentFound, setRecentFound] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecentItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [lost, found] = await Promise.all([
        fetchItems({ type: 'lost', recent: true, limit: 3 }),
        fetchItems({ type: 'found', recent: true, limit: 3 }),
      ]);

      setRecentLost(lost);
      setRecentFound(found);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load recent activity.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRecentItems();
  }, [loadRecentItems]);

  const sections = useMemo<Section[]>(
    () => [
      {
        id: 'lost',
        title: 'Recent lost posts',
        subtitle: 'The newest reports from people still searching for their belongings.',
        route: '/lostItems',
        routeLabel: 'See all lost posts',
        items: recentLost,
      },
      {
        id: 'found',
        title: 'Recent found posts',
        subtitle: 'Recently reported items that may already have someone looking for them.',
        route: '/foundItems',
        routeLabel: 'See all found posts',
        items: recentFound,
      },
    ],
    [recentFound, recentLost]
  );

  const totalPosts = recentLost.length + recentFound.length;
  const openLost = recentLost.filter((item) => item.status === 'open').length;
  const openFound = recentFound.filter((item) => item.status === 'open').length;

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

  if (loading && !totalPosts) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.stateText}>Preparing the latest campus activity...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
      <FlatList
        data={sections}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRecentItems(true)} tintColor="#2563eb" />}
        ListHeaderComponent={
          <View>
            <View style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroEyebrow}>UBT FindPoint</Text>
              </View>
              <Text style={styles.heroTitle}>Find faster. Return things sooner. Keep campus connected.</Text>
              <Text style={styles.heroSubtitle}>
                Stay close to the newest campus reports, submit a post in seconds, and move quickly between lost and found activity.
              </Text>

              <View style={styles.heroHighlightRow}>
                <View style={styles.heroHighlightCard}>
                  <Text style={styles.heroHighlightValue}>{String(openLost)}</Text>
                  <Text style={styles.heroHighlightLabel}>Urgent lost</Text>
                </View>
                <View style={styles.heroHighlightCard}>
                  <Text style={styles.heroHighlightValue}>{String(openFound)}</Text>
                  <Text style={styles.heroHighlightLabel}>Recent found</Text>
                </View>
              </View>

              <View style={styles.heroActionRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.push({ pathname: '/home/report', params: { type: 'lost' } })}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryButtonText}>Report lost item</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push({ pathname: '/home/report', params: { type: 'found' } })}
                  activeOpacity={0.88}
                >
                  <Text style={styles.secondaryButtonText}>Report found item</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard label="Recent posts" value={String(totalPosts)} />
              <MetricCard label="Open lost" value={String(openLost)} />
              <MetricCard label="Open found" value={String(openFound)} />
            </View>

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>How Home works now</Text>
              <Text style={styles.insightText}>
                Home is focused on the newest activity only, so urgent reports stay visible first. Use Lost Items and Found Items for deeper browsing and advanced search.
              </Text>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{item.title}</Text>
                <Text style={styles.sectionSubtitle}>{item.subtitle}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push(item.route)} activeOpacity={0.88}>
                <Text style={styles.sectionLink}>{item.routeLabel}</Text>
              </TouchableOpacity>
            </View>

            {item.items.length ? (
              item.items.map((post) => {
                const imageUrl = post.media?.[0]?.url ? getAssetUrl(post.media[0].url) : '';
                return (
                  <TouchableOpacity
                    key={String(post.item_id)}
                    style={styles.postCard}
                    onPress={() => openDetails(post)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.postMeta}>
                      <Text style={styles.postType}>{post.type.toUpperCase()}</Text>
                      <Text style={styles.postTime}>{formatRelativeItemDate(post.created_at)}</Text>
                    </View>
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postInfo}>
                      {(post.category_name || 'Uncategorized')} | {(post.location_name || 'Unknown place')}
                    </Text>
                    <Text numberOfLines={2} style={styles.postDescription}>
                      {post.description || 'No description provided.'}
                    </Text>
                    {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.postImage} /> : null}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No recent activity in this section yet.</Text>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerWrap}>
            <HomeCalendar />
          </View>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf4f8',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 108,
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
    color: '#526175',
    textAlign: 'center',
  },
  heroCard: {
    marginTop: 14,
    backgroundColor: '#10233f',
    borderRadius: 30,
    padding: 22,
    overflow: 'hidden',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#dbeafe',
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 32,
    lineHeight: 39,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: '#d8e6f5',
  },
  heroHighlightRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroHighlightCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  heroHighlightValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  heroHighlightLabel: {
    color: '#c9dbef',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  heroActionRow: {
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#10233f',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10233f',
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#526175',
    fontWeight: '700',
  },
  insightCard: {
    marginTop: 14,
    backgroundColor: '#f8fbff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
  },
  insightText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#526175',
  },
  errorText: {
    marginTop: 12,
    color: '#dc2626',
    fontSize: 14,
  },
  sectionCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  footerWrap: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#10233f',
  },
  sectionSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#526175',
  },
  sectionLink: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
    backgroundColor: '#eef4fb',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  postCard: {
    marginTop: 12,
    backgroundColor: '#f7fbff',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e5edf6',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  postType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563eb',
  },
  postTime: {
    fontSize: 12,
    color: '#6b7b91',
  },
  postTitle: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: '800',
    color: '#10233f',
  },
  postInfo: {
    marginTop: 6,
    fontSize: 13,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  postDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#526175',
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: '#dbe7f3',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7b91',
  },
});
