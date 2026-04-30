import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useCategoryViewModel } from '../../category/viewmodel/useCategoryViewModel';
import { useLocationViewModel } from '../../location/viewmodel/useLocationViewModel';
import type { Category } from '../../category/model/CategoryModel';
import type { Location } from '../../location/model/LocationModel';
import { useItemViewModel } from '../viewmodel/itemViewModel';

interface MediaFile {
  uri: string;
  name: string;
  type: string;
}

export default function AddItemScreen() {
  const { addItem, loading } = useItemViewModel();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [foundDate, setFoundDate] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.category_id === categoryId) ?? null,
    [categories, categoryId]
  );

  const selectedLocation = useMemo(
    () => locations.find((location) => location.location_id === locationId) ?? null,
    [locations, locationId]
  );

  const loadLookupData = async () => {
    try {
      setLoadingData(true);
      setError(null);

      const [categoryData, locationData] = await Promise.all([
        useCategoryViewModel.getCategories(),
        useLocationViewModel.getLocations(),
      ]);

      setCategories(categoryData);
      setLocations(locationData);
      setCategoryId((current) => current ?? categoryData[0]?.category_id ?? null);
      setLocationId((current) => current ?? locationData[0]?.location_id ?? null);
    } catch (lookupError) {
      setError('Failed to load categories and locations.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadLookupData();
  }, []);

  const pickMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera roll permissions to select media.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || `media_${Date.now()}`;
        const fileType = asset.type || 'image/jpeg';

        setMediaFiles((current) => [
          ...current,
          {
            uri: asset.uri,
            name: fileName,
            type: fileType,
          },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick media.');
    }
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !categoryId || !locationId) {
      Alert.alert('Missing details', 'Please complete the required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim() || '');
      formData.append('type', type);
      formData.append('category_id', categoryId.toString());
      formData.append('location_id', locationId.toString());
      if (foundDate.trim()) formData.append('found_date', foundDate.trim());
      formData.append('is_anonymous', isAnonymous ? '1' : '0');

      // Append media files
      mediaFiles.forEach((file, index) => {
        formData.append(`media_${index}`, {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      // Use FormData instead of JSON for file upload
      await addItem(formData as any);

      setTitle('');
      setDescription('');
      setType('lost');
      setFoundDate('');
      setIsAnonymous(false);
      setMediaFiles([]);

      Alert.alert('Success', 'Item created successfully.');
    } catch (submitError) {
      Alert.alert('Failed to create item', 'Please check your connection and try again.');
    }
  };

  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading categories and locations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" backgroundColor="#F1F5F9" translucent={false} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLookupData} activeOpacity={0.85}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#F1F5F9" translucent={false} />
      <KeyboardAvoidingView
        style={styles.keyboardWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.heading}>Add Item</Text>

        <Text style={styles.label}>Type</Text>
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentButton, type === 'lost' && styles.segmentButtonActive]}
            onPress={() => setType('lost')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segmentButtonText, type === 'lost' && styles.segmentButtonTextActive]}>Lost</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentButton, type === 'found' && styles.segmentButtonActive]}
            onPress={() => setType('found')}
            activeOpacity={0.85}
          >
            <Text style={[styles.segmentButtonText, type === 'found' && styles.segmentButtonTextActive]}>Found</Text>
          </TouchableOpacity>
        </View>

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
          placeholder="Describe distinguishing details"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.textArea]}
        />

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setCategoryModalVisible(true)} activeOpacity={0.85}>
          <Text style={selectedCategory ? styles.selectButtonText : styles.placeholderText}>
            {selectedCategory ? selectedCategory.name : 'Select a category'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Location</Text>
        <TouchableOpacity style={styles.selectButton} onPress={() => setLocationModalVisible(true)} activeOpacity={0.85}>
          <Text style={selectedLocation ? styles.selectButtonText : styles.placeholderText}>
            {selectedLocation ? selectedLocation.name : 'Select a location'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Found Date</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
          value={foundDate}
          onChangeText={setFoundDate}
          style={styles.input}
        />

        <Text style={styles.label}>Media</Text>
        <TouchableOpacity style={styles.pickMediaButton} onPress={pickMedia} activeOpacity={0.85}>
          <Text style={styles.pickMediaButtonText}>Pick Photo or File</Text>
        </TouchableOpacity>

        {mediaFiles.length > 0 ? (
          <View style={styles.mediaList}>
            <FlatList
              data={mediaFiles}
              scrollEnabled={false}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              renderItem={({ item, index }) => (
                <View style={styles.mediaChip}>
                  <Text style={styles.mediaChipText} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeMediaFile(index)}>
                    <Text style={styles.mediaRemoveText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>Report Anonymously</Text>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
        </View>

          <TouchableOpacity
            style={[styles.submitButton, (loading || !title.trim()) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading || !title.trim()}
          >
            <Text style={styles.submitButtonText}>{loading ? 'Creating...' : 'Add Item'}</Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={categoryModalVisible} transparent animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item.category_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setCategoryId(item.category_id);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setCategoryModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={locationModalVisible} transparent animationType="fade" onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <FlatList
              data={locations}
              keyExtractor={(item) => item.location_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setLocationId(item.location_id);
                    setLocationModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setLocationModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F1F5F9',
    paddingTop: 16,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  card: {
    width: '100%',
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#475569',
    fontSize: 15,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  segmentRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  segmentButtonText: {
    color: '#334155',
    fontWeight: '600',
  },
  segmentButtonTextActive: {
    color: '#1D4ED8',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 14,
  },
  selectButtonText: {
    color: '#0F172A',
    fontSize: 15,
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  pickMediaButton: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  pickMediaButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  mediaList: {
    marginBottom: 14,
  },
  mediaChip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  mediaChipText: {
    color: '#0F172A',
    marginBottom: 6,
  },
  mediaRemoveText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#0F172A',
  },
  modalCloseButton: {
    marginTop: 14,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
