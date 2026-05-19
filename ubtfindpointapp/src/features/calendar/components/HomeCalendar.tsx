import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Calendar } from 'react-native-calendars';
import api from '../../../services/api';
import type { Item } from '../../items/model/ItemModel';

export default function HomeCalendar() {
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

  // 🔥 SUPER ROBUST DATE FIX (KY E ZGJIDH 100% BUGUN)
  const getDateKey = (value?: string | Date) => {
    if (!value) return null;

    const date = new Date(value);

    if (isNaN(date.getTime())) return null;

    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  // 📅 MARKED DATES
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    items.forEach((item) => {
      const dateKey = getDateKey(item.date);
      if (!dateKey) return;

      if (!marks[dateKey]) {
        marks[dateKey] = {
          marked: true,
          dots: [],
        };
      }

      marks[dateKey].dots.push({
        color: item.type === 'lost' ? '#2563EB' : '#059669',
      });
    });

    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: '#111827',
      };
    }

    return marks;
  }, [items, selectedDate]);

  // 🔍 FILTER BY DATE
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const dateKey = getDateKey(item.date);
      return dateKey === selectedDate;
    });
  }, [items, selectedDate]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 📅 CALENDAR */}
      <Calendar
        markedDates={markedDates}
        markingType={'multi-dot'}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        maxDate={getDateKey(new Date()) || undefined}
        theme={{
          todayTextColor: '#2563EB',
          arrowColor: '#2563EB',
          selectedDayBackgroundColor: '#111827',
        }}
      />

      {/* 📄 RESULTS */}
      <View style={styles.resultContainer}>
        <Text style={styles.title}>
          Reported Items ({filteredItems.length})
        </Text>

        {selectedDate === '' ? (
          <Text style={styles.emptyText}>
            Select a date to see reported items.
          </Text>
        ) : filteredItems.length === 0 ? (
          <Text style={styles.emptyText}>
            No items reported on this date.
          </Text>
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.item_id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.85} style={styles.card}>

                {/* TYPE */}
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        item.type === 'lost'
                          ? '#DBEAFE'
                          : '#DCFCE7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          item.type === 'lost'
                            ? '#1D4ED8'
                            : '#15803D',
                      },
                    ]}
                  >
                    {item.type.toUpperCase()}
                  </Text>
                </View>

                {/* TITLE */}
                <Text style={styles.itemTitle}>{item.title}</Text>

                {/* DESCRIPTION */}
                <Text style={styles.description}>
                  {item.description || 'No description'}
                </Text>

                {/* LOCATION */}
                <Text style={styles.metaText}>
                  📍 {item.location_name || 'Unknown location'}
                </Text>

                {/* CATEGORY */}
                <Text style={styles.metaText}>
                  🗂 {item.category_name || 'No category'}
                </Text>

                {/* EVENT DATE */}
                <Text style={styles.metaText}>
                  📅 Event: {getDateKey(item.date) || 'N/A'}
                </Text>

                {/* REPORTED DATE */}
                <Text style={styles.metaText}>
                  🕒 Reported: {getDateKey(item.created_at) || 'N/A'}
                </Text>

              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  resultContainer: {
    padding: 14,
  },

  title: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },

  emptyText: {
    color: '#6B7280',
    fontSize: 15,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },

  badgeText: {
    fontWeight: '700',
    fontSize: 12,
  },

  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});