import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ClientHeader from '@/src/components/ClientHeader';
import type { Item } from '../model/ItemModel';
import { filterItems, formatItemDate, formatRelativeItemDate, getAssetUrl, uniqueItemValues } from '../viewmodel/itemHelpers';

type ItemFeedScreenProps = {
  title: string;
  subtitle: string;
  highlight: string;
  accent: string;
  items: Item[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  emptyTitle: string;
  emptySubtitle: string;
  enableTypeFilter?: boolean;
  initialTypeFilter?: 'All' | 'Lost' | 'Found';
  showReportActions?: boolean;
};

const statuses = ['All', 'Open', 'Claimed', 'Resolved', 'Expired'];
const typeOptions = ['All', 'Lost', 'Found'] as const;

export default function ItemFeedScreen({
  title,
  subtitle,
  highlight,
  accent,
  items,
  loading,
  refreshing,
  error,
  onRefresh,
  emptyTitle,
  emptySubtitle,
  enableTypeFilter = false,
  initialTypeFilter = 'All',
  showReportActions = false,
}: ItemFeedScreenProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState<'All' | 'Lost' | 'Found'>(initialTypeFilter);

  const categories = useMemo(() => uniqueItemValues(items, 'category_name'), [items]);
  const locations = useMemo(() => uniqueItemValues(items, 'location_name'), [items]);
  const typeFilteredItems = useMemo(() => {
    if (!enableTypeFilter || selectedType === 'All') {
      return items;
    }

    return items.filter((item) => item.type === selectedType.toLowerCase());
  }, [enableTypeFilter, items, selectedType]);
  const filteredItems = useMemo(
    () => filterItems(typeFilteredItems, query, selectedCategory, selectedLocation, selectedStatus),
    [typeFilteredItems, query, selectedCategory, selectedLocation, selectedStatus]
  );
  const activeFilterCount = [selectedCategory, selectedLocation, selectedStatus, enableTypeFilter ? selectedType : 'All'].filter((value) => value !== 'All').length;
  const countSummary = useMemo(() => {
    const lostCount = items.filter((item) => item.type === 'lost').length;
    const foundCount = items.filter((item) => item.type === 'found').length;

    return {
      lostCount,
      foundCount,
      totalCount: items.length,
    };
  }, [items]);

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
      <ClientHeader />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.item_id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
        ListHeaderComponent={
          <View>
            <LinearGradient
              colors={['#0f3f75', '#1b5da4', '#3d8be0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.heroCopyWrap}>
                  <Text style={styles.heroEyebrow}>{highlight}</Text>
                  <Text style={styles.heroTitle}>{title}</Text>
                  <Text style={styles.heroSubtitle}>{subtitle}</Text>
                </View>
                <View style={styles.heroIconShell}>
                  <Ionicons name="layers-outline" size={30} color="#ffffff" />
                </View>
              </View>

              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaCard}>
                  <Text style={styles.heroMetaValue}>{String(filteredItems.length)}</Text>
                  <Text style={styles.heroMetaLabel}>Visible now</Text>
                </View>
                <View style={styles.heroMetaCard}>
                  <Text style={styles.heroMetaValue}>{String(activeFilterCount)}</Text>
                  <Text style={styles.heroMetaLabel}>Filters on</Text>
                </View>
                <View style={styles.heroMetaCard}>
                  <Text style={styles.heroMetaValue}>{String(countSummary.totalCount)}</Text>
                  <Text style={styles.heroMetaLabel}>All reports</Text>
                </View>
              </View>

              <View style={styles.snapshotRow}>
                <View style={styles.snapshotPill}>
                  <Ionicons name="alert-circle-outline" size={14} color="#ffd6d9" />
                  <Text style={styles.snapshotText}>{countSummary.lostCount} lost</Text>
                </View>
                <View style={styles.snapshotPill}>
                  <Ionicons name="checkmark-circle-outline" size={14} color="#d5ffe2" />
                  <Text style={styles.snapshotText}>{countSummary.foundCount} found</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.searchCard}>
              <View style={styles.searchHeaderRow}>
                <View>
                  <Text style={styles.searchTitle}>Browse and filter</Text>
                  <Text style={styles.searchSubtitle}>Jump between lost and found reports and narrow the list fast.</Text>
                </View>
                <View style={styles.searchIconWrap}>
                  <Ionicons name="options-outline" size={18} color={accent} />
                </View>
              </View>
              {showReportActions ? (
                <View style={styles.reportActionsRow}>
                  <TouchableOpacity
                    style={[styles.reportActionCard, styles.reportLostCard]}
                    activeOpacity={0.9}
                    onPress={() => router.push({ pathname: '/home/report', params: { type: 'lost' } })}
                  >
                    <View style={styles.reportActionIconWrap}>
                      <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
                    </View>
                    <Text style={styles.reportActionEyebrow}>Need help?</Text>
                    <Text style={styles.reportActionTitle}>Report Lost</Text>
                    <Text style={styles.reportActionText}>Create a post so others can help identify a missing item.</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.reportActionCard, styles.reportFoundCard]}
                    activeOpacity={0.9}
                    onPress={() => router.push({ pathname: '/home/report', params: { type: 'found' } })}
                  >
                    <View style={styles.reportActionIconWrap}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#16a34a" />
                    </View>
                    <Text style={styles.reportActionEyebrow}>Ready to return?</Text>
                    <Text style={styles.reportActionTitle}>Report Found</Text>
                    <Text style={styles.reportActionText}>Log what you found and make it easier to reconnect it.</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
              <View style={styles.searchInputWrap}>
                <Ionicons name="search-outline" size={18} color="#94a3b8" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search title, description, category, location, reward, or poster"
                  placeholderTextColor="#94a3b8"
                  style={styles.searchInput}
                />
              </View>

              {enableTypeFilter ? (
                <FilterStrip label="Type" options={[...typeOptions]} selected={selectedType} onSelect={(value) => setSelectedType(value as 'All' | 'Lost' | 'Found')} accent={accent} />
              ) : null}
              <FilterStrip label="Status" options={statuses} selected={selectedStatus} onSelect={setSelectedStatus} accent={accent} />
              <FilterStrip label="Category" options={categories} selected={selectedCategory} onSelect={setSelectedCategory} accent={accent} />
              <FilterStrip label="Location" options={locations} selected={selectedLocation} onSelect={setSelectedLocation} accent={accent} />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        }
        renderItem={({ item }) => {
          const displayName = item.is_anonymous ? 'Anonymous' : item.poster_name || item.fullName || 'Unknown user';
          const imageUrl = item.media?.[0]?.url ? getAssetUrl(item.media[0].url) : '';

          return (
            <TouchableOpacity
              style={styles.postCard}
              activeOpacity={0.9}
              onPress={() =>
                router.push({
                  pathname: '/home/details',
                  params: {
                    itemId: String(item.item_id),
                    userId: String(item.user_id || ''),
                    title: item.title,
                    description: item.description || '',
                    status: String(item.status),
                    type: item.type,
                    poster: displayName,
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
                })
              }
            >
              <View style={styles.postHeader}>
                <View style={[styles.avatar, { backgroundColor: accent }]}>
                  <Text style={styles.avatarText}>{displayName.slice(0, 1).toUpperCase()}</Text>
                </View>

                <View style={styles.headerTextWrap}>
                  <Text style={styles.posterName}>{displayName}</Text>
                  <Text style={styles.postDate}>
                    {formatRelativeItemDate(item.created_at)} | {formatItemDate(item.created_at)}
                  </Text>
                </View>

                <View style={[styles.typePill, item.type === 'lost' ? styles.typePillLost : styles.typePillFound]}>
                  <Text style={[styles.typePillText, item.type === 'lost' ? styles.typePillTextLost : styles.typePillTextFound]}>
                    {item.type.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <View style={styles.statusWrap}>
                  <Text style={[styles.statusText, { color: accent }]}>{String(item.status).toUpperCase()}</Text>
                </View>
                {item.reward ? (
                  <View style={styles.rewardPill}>
                    <Ionicons name="gift-outline" size={12} color="#b45309" />
                    <Text style={styles.rewardPillText}>{item.reward}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postBody}>{item.description || 'No description provided.'}</Text>

              <View style={styles.postTags}>
                <Tag label={item.category_name || 'Uncategorized'} accent={accent} />
                <Tag label={item.location_name || 'Unknown place'} accent={accent} />
              </View>

              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.postImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name={item.type === 'lost' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                    size={28}
                    color={item.type === 'lost' ? '#ef4444' : '#16a34a'}
                  />
                  <Text style={styles.imagePlaceholderText}>No photo attached</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{loading ? 'Loading...' : emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>
              {loading ? 'Please wait while we prepare the latest posts.' : emptySubtitle}
            </Text>
          </View>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function FilterStrip({
  label,
  options,
  selected,
  onSelect,
  accent,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  accent: string;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {options.map((option) => {
          const active = option === selected;
          return (
            <TouchableOpacity
              key={`${label}-${option}`}
              style={[
                styles.filterChip,
                active && {
                  backgroundColor: accent,
                  borderColor: accent,
                },
              ]}
              onPress={() => onSelect(option)}
              activeOpacity={0.88}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Tag({ label, accent }: { label: string; accent: string }) {
  return (
    <View style={styles.tag}>
      <Text style={[styles.tagText, { color: accent }]}>{label}</Text>
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
  heroCard: {
    marginTop: 14,
    borderRadius: 28,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroCopyWrap: {
    flex: 1,
  },
  heroIconShell: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#d7ebff',
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 29,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.84)',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroMetaCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroMetaValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  heroMetaLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  snapshotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  snapshotText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchCard: {
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
  },
  searchSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
    maxWidth: 260,
  },
  searchIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eef4fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  reportActionCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 136,
  },
  reportLostCard: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  reportFoundCard: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  reportActionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reportActionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reportActionTitle: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
    color: '#10233f',
  },
  reportActionText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#526175',
  },
  searchInputWrap: {
    height: 56,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#f7fbff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#10233f',
  },
  filterGroup: {
    marginTop: 14,
  },
  filterLabel: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#526175',
  },
  filterRow: {
    gap: 10,
    paddingRight: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    backgroundColor: '#eef4fb',
  },
  filterChipText: {
    color: '#1e3a8a',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  errorText: {
    marginTop: 12,
    color: '#dc2626',
    fontSize: 14,
  },
  postCard: {
    marginTop: 14,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTextWrap: {
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  posterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10233f',
  },
  postDate: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7b91',
  },
  typePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typePillLost: {
    backgroundColor: '#fff1f2',
  },
  typePillFound: {
    backgroundColor: '#ecfdf5',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  typePillTextLost: {
    color: '#dc2626',
  },
  typePillTextFound: {
    color: '#16a34a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  statusWrap: {
    backgroundColor: '#f7fbff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e5edf6',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  rewardPillText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '700',
  },
  postTitle: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: '800',
    color: '#10233f',
  },
  postBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: '#526175',
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#f2f7fc',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginTop: 14,
    backgroundColor: '#dbe7f3',
  },
  imagePlaceholder: {
    marginTop: 14,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#526175',
  },
});
