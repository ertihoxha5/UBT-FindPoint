import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../services/api';
import type { Item } from '../../items/model/ItemModel';
import { getAssetUrl } from '../../items/viewmodel/itemHelpers';

const { width } = Dimensions.get('window');
type GradientPair = readonly [string, string];

export default function HomeCalendar() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentMonth, setCurrentMonth] = useState<string>('');

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
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
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
      if (!dateKey) return;

      const dot = {
        key: `${item.item_id}-${item.type}`,
        color: item.type === 'lost' ? '#ff6b6b' : '#51cf66',
      };

      if (!marks[dateKey]) {
        marks[dateKey] = {
          marked: true,
          dots: [dot],
          selectedColor: '#4a90e2',
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
        selectedColor: '#4a90e2',
      };
    }

    return marks;
  }, [getItemCalendarDate, items, selectedDate]);

  const filteredItems = useMemo(
    () => items.filter((item) => getItemCalendarDate(item) === selectedDate),
    [getItemCalendarDate, items, selectedDate]
  );

  const getItemCountByType = () => {
    const lost = filteredItems.filter(i => i.type === 'lost').length;
    const found = filteredItems.filter(i => i.type === 'found').length;
    return { lost, found, total: filteredItems.length };
  };

  const counts = getItemCountByType();
  const calendarTheme = useMemo(
    () => ({
      calendarBackground: '#ffffff',
      textSectionTitleColor: '#94a3b8',
      selectedDayBackgroundColor: '#4a90e2',
      selectedDayTextColor: '#ffffff',
      todayTextColor: '#4a90e2',
      dayTextColor: '#1a3a5c',
      monthTextColor: '#1a3a5c',
      arrowColor: '#4a90e2',
      textDayFontSize: 14,
      textMonthFontSize: 16,
      textDayHeaderFontSize: 12,
      textDayFontWeight: '500' as const,
      textMonthFontWeight: '700' as const,
      textDayHeaderFontWeight: '600' as const,
    }),
    []
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#f8fafc', '#ffffff']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={24} color="#4a90e2" />
          </View>
          <Text style={styles.headerTitle}>Activity Calendar</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Track lost and found items by date
        </Text>
      </LinearGradient>

      <View style={styles.calendarWrapper}>
        <Calendar
          markedDates={markedDates}
          markingType="multi-dot"
          onDayPress={(day) => setSelectedDate(day.dateString)}
          onMonthChange={(month) => setCurrentMonth(`${month.year}-${month.month}`)}
          maxDate={getDateKey(new Date()) || undefined}
          theme={calendarTheme}
          style={styles.calendar}
        />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]} />
          <Text style={styles.legendText}>Lost Items</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#51cf66' }]} />
          <Text style={styles.legendText}>Found Items</Text>
        </View>
      </View>

      <View style={styles.resultsWrap}>
        {selectedDate ? (
          <>
            <View style={styles.resultsHeader}>
              <View>
                <Text style={styles.resultsDate}>
                  {new Date(selectedDate).toLocaleDateString('default', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
                <View style={styles.resultsStats}>
                  <View style={styles.statBadge}>
                    <Ionicons name="alert-circle" size={12} color="#ff6b6b" />
                    <Text style={styles.statText}>{counts.lost} Lost</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#51cf66" />
                    <Text style={styles.statText}>{counts.found} Found</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="calendar" size={12} color="#4a90e2" />
                    <Text style={styles.statText}>Total: {counts.total}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedDate('')}>
                <Ionicons name="close-circle" size={22} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {filteredItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyStateTitle}>No items found</Text>
                <Text style={styles.emptyStateText}>
                  No lost or found items were reported on this date.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.itemsList}>
                {filteredItems.map((item, index) => {
                  const imageUrl = item.media?.[0]?.url ? getAssetUrl(item.media[0].url) : '';
                  const displayName = item.is_anonymous ? 'Anonymous' : item.poster_name || item.fullName || 'Unknown user';
                  const colors: GradientPair =
                    item.type === 'lost' ? ['#ff6b6b', '#ee5a52'] : ['#51cf66', '#40c057'];

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
                      }
                    >
                      <LinearGradient
                        colors={colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.cardGradient}
                      >
                        <Text style={styles.cardType}>
                          {item.type === 'lost' ? 'LOST' : 'FOUND'}
                        </Text>
                      </LinearGradient>

                      <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        
                        <View style={styles.cardMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="location-outline" size={12} color="#6c8db0" />
                            <Text style={styles.metaText}>{item.location_name || 'Unknown'}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Ionicons name="folder-outline" size={12} color="#6c8db0" />
                            <Text style={styles.metaText}>{item.category_name || 'Uncategorized'}</Text>
                          </View>
                        </View>

                        <Text style={styles.cardDescription} numberOfLines={2}>
                          {item.description || 'No description provided.'}
                        </Text>

                        {imageUrl && (
                          <Image source={{ uri: imageUrl }} style={styles.cardImage} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color="#cbd5e1" />
            <Text style={styles.emptyStateTitle}>Select a date</Text>
            <Text style={styles.emptyStateText}>
              Tap on any marked date to view lost and found items reported that day
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7ff',
    borderRadius: 24,
    overflow: 'hidden',
  },
  loadingContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderRadius: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6c8db0',
    lineHeight: 18,
  },
  calendarWrapper: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  calendar: {
    borderRadius: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#6c8db0',
    fontWeight: '500',
  },
  resultsWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  resultsDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  resultsStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a3a5c',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 40,
  },
  itemsList: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 12,
  },
  cardType: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a3a5c',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6c8db0',
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
});
