import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import { useItemViewModel } from '../viewmodel/itemViewModel';

export default function AddItemScreen() {
  const { addItem, loading } = useItemViewModel();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    await addItem({
      title: title.trim(),
      description: description.trim(),
      type: 'lost',
      category_id: 'cat_1',
      location_id: 'loc_1',
      is_anonymous: false,
    });

    setTitle('');
    setDescription('');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.heading}>Report an Item</Text>
        <Text style={styles.subheading}>Fill in the details for the lost item.</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          placeholder="e.g. Black Wallet"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Add key details like color, brand, and where it was last seen"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.textArea]}
        />

        <TouchableOpacity
          style={[styles.submitButton, (loading || !title.trim() || !description.trim()) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loading || !title.trim() || !description.trim()}
        >
          <Text style={styles.submitButtonText}>{loading ? 'Creating...' : 'Add Item'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  subheading: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 14,
    color: '#475569',
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 14,
  },
  textArea: {
    minHeight: 120,
  },
  submitButton: {
    marginTop: 4,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});