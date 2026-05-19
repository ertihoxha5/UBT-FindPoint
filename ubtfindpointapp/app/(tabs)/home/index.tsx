import React from 'react';
import { ScrollView, View } from 'react-native';

import ItemScreen from '@/src/features/items/view/ItemScreen';
import HomeCalendar from '@/src/features/calendar/components/HomeCalendar';

export default function Home() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f4f8fc' }}>
      <ItemScreen />
      <View style={{ marginTop: 16 }}>
        <HomeCalendar />
      </View>
    </ScrollView>
  );
}