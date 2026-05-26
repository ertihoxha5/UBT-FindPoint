import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import type { Item } from '../model/ItemModel';
import { fetchItems } from '../viewmodel/itemViewModel';
import ItemFeedScreen from './ItemFeedScreen';

export default function ItemsScreen() {
  const params = useLocalSearchParams<{ type?: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      setItems(await fetchItems());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load item posts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (loading && !items.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f8ff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#475569' }}>Loading items...</Text>
      </View>
    );
  }

  return (
    <ItemFeedScreen
      title="Items"
      subtitle="Browse both lost and found reports in one place, filter quickly, and create a new report from here."
      highlight="One shared feed"
      accent="#2563eb"
      items={items}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRefresh={() => loadItems(true)}
      emptyTitle="No matching item reports"
      emptySubtitle="Try changing the filters or check back after new lost and found reports are posted."
      enableTypeFilter
      initialTypeFilter={params.type === 'lost' ? 'Lost' : params.type === 'found' ? 'Found' : 'All'}
      showReportActions
    />
  );
}
