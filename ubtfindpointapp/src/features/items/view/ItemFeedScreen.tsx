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
};

const statuses = ['All', 'Open', 'Claimed', 'Resolved', 'Expired'];

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
}: ItemFeedScreenProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const categories = useMemo(() => uniqueItemValues(items, 'category_name'), [items]);
  const locations = useMemo(() => uniqueItemValues(items, 'location_name'), [items]);
  const filteredItems = useMemo(
    () => filterItems(items, query, selectedCategory, selectedLocation, selectedStatus),
    [items, query, selectedCategory, selectedLocation, selectedStatus]
  );
  const activeFilterCount = [selectedCategory, selectedLocation, selectedStatus].filter((value) => value !== 'All').length;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.item_id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
        ListHeaderComponent={
          <View>
            <View style={styles.heroCard}>
              <Text style={[styles.heroEyebrow, { color: accent }]}>{highlight}</Text>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>
              <View style={styles.heroMetaRow}>
                <View style={styles.heroMetaCard}>
                  <Text style={styles.heroMetaValue}>{String(filteredItems.length)}</Text>
                  <Text style={styles.heroMetaLabel}>Visible posts</Text>
                </View>
                <View style={styles.heroMetaCard}>
                  <Text style={styles.heroMetaValue}>{String(activeFilterCount)}</Text>
                  <Text style={styles.heroMetaLabel}>Active filters</Text>
                </View>
              </View>
            </View>

            <View style={styles.searchCard}>
              <Text style={styles.searchTitle}>Advanced search</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search title, description, category, location, reward, or poster"
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
              />

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

                <View style={{ flex: 1 }}>
                  <Text style={styles.posterName}>{displayName}</Text>
                  <Text style={styles.postDate}>
                    {formatRelativeItemDate(item.created_at)} | {formatItemDate(item.created_at)}
                  </Text>
                </View>

                <View style={styles.statusWrap}>
                  <Text style={[styles.statusText, { color: accent }]}>{String(item.status).toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postBody}>{item.description || 'No description provided.'}</Text>

              <View style={styles.postTags}>
                <Tag label={item.type.toUpperCase()} accent={accent} />
                <Tag label={item.category_name || 'Uncategorized'} accent={accent} />
                <Tag label={item.location_name || 'Unknown place'} accent={accent} />
                {item.reward ? <Tag label={`Reward: ${item.reward}`} accent={accent} /> : null}
              </View>

              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.postImage} /> : null}
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
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    fontSize: 29,
    fontWeight: '800',
    color: '#10233f',
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#526175',
  },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroMetaCard: {
    flex: 1,
    backgroundColor: '#f7fbff',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5edf6',
  },
  heroMetaValue: {
    color: '#10233f',
    fontSize: 22,
    fontWeight: '800',
  },
  heroMetaLabel: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
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
  searchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
    marginBottom: 12,
  },
  searchInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 18,
    paddingHorizontal: 16,
    backgroundColor: '#f7fbff',
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
  postTitle: {
    marginTop: 14,
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
