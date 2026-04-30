import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import type { Item } from '../model/ItemModel';
import { fetchItems } from '../viewmodel/itemViewModel';
import ItemFeedScreen from './ItemFeedScreen';

export default function FoundItemScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFoundItems = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      setItems(await fetchItems({ type: 'found' }));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load found item posts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFoundItems();
  }, [loadFoundItems]);

  if (loading && !items.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f8ff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: '#475569' }}>Loading found items...</Text>
      </View>
    );
  }

  return (
    <ItemFeedScreen
      title="Found Items"
      subtitle="Use the advanced search tools to narrow down reports by status, category, or where it was found."
      highlight="Reconnect items"
      accent="#1d4ed8"
      items={items}
      loading={loading}
      refreshing={refreshing}
      error={error}
      onRefresh={() => loadFoundItems(true)}
      emptyTitle="No matching found item reports"
      emptySubtitle="Adjust the search filters or check again when new found-item reports arrive."
    />
  );
}
