import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import HomeCalendar from '../components/HomeCalendar';

const { width, height } = Dimensions.get('window');

export default function CalendarScreen() {
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>('calendar');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
      
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={22} color="#4a90e2" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, selectedView === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setSelectedView('calendar')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="calendar-outline" 
              size={18} 
              color={selectedView === 'calendar' ? '#ffffff' : '#6c8db0'} 
            />
            <Text style={[styles.toggleText, selectedView === 'calendar' && styles.toggleTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, selectedView === 'list' && styles.toggleButtonActive]}
            onPress={() => setSelectedView('list')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="list-outline" 
              size={18} 
              color={selectedView === 'list' ? '#ffffff' : '#6c8db0'} 
            />
            <Text style={[styles.toggleText, selectedView === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.calendarWrapper}>
          <HomeCalendar />
        </View>

        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.eventCard}>
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.eventDate}
            >
              <Text style={styles.eventDay}>15</Text>
              <Text style={styles.eventMonth}>MAY</Text>
            </LinearGradient>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Lost & Found Workshop</Text>
              <View style={styles.eventMeta}>
                <Ionicons name="time-outline" size={14} color="#6c8db0" />
                <Text style={styles.eventMetaText}>10:00 AM - 12:00 PM</Text>
              </View>
              <View style={styles.eventMeta}>
                <Ionicons name="location-outline" size={14} color="#6c8db0" />
                <Text style={styles.eventMetaText}>Main Hall, Room 101</Text>
              </View>
            </View>
          </View>

          <View style={styles.eventCard}>
            <LinearGradient
              colors={['#51cf66', '#40c057']}
              style={styles.eventDate}
            >
              <Text style={styles.eventDay}>20</Text>
              <Text style={styles.eventMonth}>MAY</Text>
            </LinearGradient>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Campus Cleanup Day</Text>
              <View style={styles.eventMeta}>
                <Ionicons name="time-outline" size={14} color="#6c8db0" />
                <Text style={styles.eventMetaText}>09:00 AM - 02:00 PM</Text>
              </View>
              <View style={styles.eventMeta}>
                <Ionicons name="location-outline" size={14} color="#6c8db0" />
                <Text style={styles.eventMetaText}>Campus Grounds</Text>
              </View>
            </View>
          </View>

          <View style={styles.eventCard}>
            <LinearGradient
              colors={['#ff6b6b', '#ee5a52']}
              style={styles.eventDate}
            >
              <Text style={styles.eventDay}>25</Text>
              <Text style={styles.eventMonth}>MAY</Text>
            </LinearGradient>
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>Lost Item Collection Drive</Text>
              <View style={styles.eventMeta}>
                <Ionicons name="time-outline" size={14} color="#6c8db0" />
                <Text style={styles.eventMetaText}>01:00 PM - 04:00 PM</Text>
              </View>
              <View style={styles.eventMeta}>
                <Ionicons name="location-outline" size={14} color="#6c8db0" />
                <Text style={styles.eventMetaText}>Student Center</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <LinearGradient
            colors={['rgba(74, 144, 226, 0.1)', 'rgba(74, 144, 226, 0.05)']}
            style={styles.tipsCard}
          >
            <View style={styles.tipsIcon}>
              <Ionicons name="bulb-outline" size={24} color="#4a90e2" />
            </View>
            <Text style={styles.tipsTitle}>Pro Tip</Text>
            <Text style={styles.tipsText}>
              Mark important dates on your calendar to never miss a lost item deadline or campus event!
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleButtonActive: {
    backgroundColor: '#4a90e2',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c8db0',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  content: {
    paddingBottom: 30,
  },
  calendarWrapper: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  upcomingSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  eventDate: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  eventDay: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  eventMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 2,
  },
  eventDetails: {
    flex: 1,
    padding: 14,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventMetaText: {
    fontSize: 12,
    color: '#6c8db0',
  },
  tipsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  tipsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#6c8db0',
    textAlign: 'center',
    lineHeight: 20,
  },
});