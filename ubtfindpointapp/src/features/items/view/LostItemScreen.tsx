import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { Item } from '../model/ItemModel';
import { fetchItems } from '../viewmodel/itemViewModel';
import ItemFeedScreen from './ItemFeedScreen';

export default function LostItemScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLostItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      setItems(await fetchItems({ type: 'lost' }));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load lost item posts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLostItems();
  }, [loadLostItems]);

  if (loading && !items.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f8ff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#475569' }}>Loading lost items...</Text>
      </View>
    );
  }

  return (
    <ItemFeedScreen
      title="Lost Items"
      subtitle="Search through active campus reports with filters for status, category, and location."
      highlight="Find faster"
      accent="#2563eb"
      items={items}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRefresh={() => loadLostItems(true)}
      emptyTitle="No matching lost item reports"
      emptySubtitle="Try broadening your search or check back after new reports are posted."
    />
  );
}
