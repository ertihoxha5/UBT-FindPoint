import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LostItemsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lost Item</Text>
      <Text style={styles.subtitle}>Browse reports for items that are still missing.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
  },
});