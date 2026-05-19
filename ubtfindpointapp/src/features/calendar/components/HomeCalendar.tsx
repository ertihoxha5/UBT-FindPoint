import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import api from '../../../services/api';
import type { Item } from '../../items/model/ItemModel';
import { getAssetUrl } from '../../items/viewmodel/itemHelpers';

export default function HomeCalendar() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/items');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log('Calendar Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateKey = useCallback((value?: string | Date) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getItemCalendarDate = useCallback((item: Item) => getDateKey(item.date || item.created_at), [getDateKey]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    items.forEach((item) => {
      const dateKey = getItemCalendarDate(item);
      if (!dateKey) {
        return;
      }

      const dot = {
        key: `${item.item_id}-${item.type}`,
        color: item.type === 'lost' ? '#2563eb' : '#059669',
      };

      if (!marks[dateKey]) {
        marks[dateKey] = {
          marked: true,
          dots: [dot],
        };
        return;
      }

      marks[dateKey].marked = true;
      marks[dateKey].dots = [...(marks[dateKey].dots || []), dot];
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: '#10233f',
      };
    }

    return marks;
  }, [getItemCalendarDate, items, selectedDate]);

  const filteredItems = useMemo(
    () => items.filter((item) => getItemCalendarDate(item) === selectedDate),
    [getItemCalendarDate, items, selectedDate]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Calendar</Text>
        <Text style={styles.title}>Tap a date to see every post reported that day</Text>
        <Text style={styles.subtitle}>Posts use the report date when available, and fall back to the created date so dates always feel responsive.</Text>
      </View>

      <Calendar
        markedDates={markedDates}
        markingType="multi-dot"
        onDayPress={(day) => setSelectedDate(day.dateString)}
        maxDate={getDateKey(new Date()) || undefined}
        theme={{
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#64748b',
          selectedDayBackgroundColor: '#10233f',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2563eb',
          dayTextColor: '#10233f',
          monthTextColor: '#10233f',
          arrowColor: '#2563eb',
          textDayFontWeight: '600',
          textMonthFontWeight: '800',
          textDayHeaderFontWeight: '700',
        }}
      />

      <View style={styles.resultsWrap}>
        <Text style={styles.resultsTitle}>
          {selectedDate ? `Posts on ${selectedDate}` : 'Choose a date'}
        </Text>

        {!selectedDate ? (
          <Text style={styles.emptyText}>Tap any marked date above to open the posts for that day.</Text>
        ) : filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>No posts were reported on this date.</Text>
        ) : (
          filteredItems.map((item) => {
            const imageUrl = item.media?.[0]?.url ? getAssetUrl(item.media[0].url) : '';
            const displayName = item.is_anonymous ? 'Anonymous' : item.poster_name || item.fullName || 'Unknown user';

            return (
              <TouchableOpacity
                key={String(item.item_id)}
                activeOpacity={0.9}
                style={styles.card}
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
                }>
                <View style={styles.cardHeader}>
                  <View style={[styles.badge, item.type === 'lost' ? styles.badgeLost : styles.badgeFound]}>
                    <Text style={[styles.badgeText, item.type === 'lost' ? styles.badgeTextLost : styles.badgeTextFound]}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.cardStatus}>{String(item.status).toUpperCase()}</Text>
                </View>

                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description || 'No description provided.'}
                </Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaPill}>{item.location_name || 'Unknown place'}</Text>
                  <Text style={styles.metaPill}>{item.category_name || 'No category'}</Text>
                </View>

                {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.cardImage} /> : null}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
  },
  eyebrow: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    marginTop: 8,
    color: '#10233f',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    color: '#526175',
    fontSize: 14,
    lineHeight: 21,
  },
  resultsWrap: {
    padding: 18,
    paddingTop: 14,
  },
  resultsTitle: {
    color: '#10233f',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyText: {
    color: '#6b7b91',
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    backgroundColor: '#f7fbff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5edf6',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeLost: {
    backgroundColor: '#dbeafe',
  },
  badgeFound: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 11,
  },
  badgeTextLost: {
    color: '#1d4ed8',
  },
  badgeTextFound: {
    color: '#15803d',
  },
  cardStatus: {
    color: '#6b7b91',
    fontSize: 11,
    fontWeight: '800',
  },
  itemTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '800',
    color: '#10233f',
  },
  description: {
    marginTop: 6,
    color: '#526175',
    fontSize: 14,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  metaPill: {
    backgroundColor: '#eef4fb',
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: '#dbe7f3',
  },
});
