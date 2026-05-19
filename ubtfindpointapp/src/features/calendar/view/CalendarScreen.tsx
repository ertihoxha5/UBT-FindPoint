import React from 'react';

import {
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import HomeCalendar from '../components/HomeCalendar';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <HomeCalendar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});