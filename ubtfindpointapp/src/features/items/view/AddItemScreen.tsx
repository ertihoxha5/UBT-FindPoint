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
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { addItem, loading } = useItemViewModel();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'lost' | 'found'>(params.type === 'found' ? 'found' : 'lost');
  const [date, setDate] = useState<Date | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const getLocalDateKey = (value: Date | null) => {
    if (!value) {
      return '';
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateLabel = (value: Date | null) => {
    if (!value) {
      return 'Choose a date';
    }

    return value.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
    } catch {
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
        Alert.alert('Permission denied', 'We need photo access to select media.');
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
    } catch {
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

    const todayKey = getLocalDateKey(new Date());
    if (date && getLocalDateKey(date) > todayKey) {
      Alert.alert('Invalid date', 'Please select today or a past date.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim() || '');
      formData.append('type', type);
      formData.append('category_id', categoryId.toString());
      formData.append('location_id', locationId.toString());
      const chosenDate = date instanceof Date ? getLocalDateKey(date) : '';
      if (chosenDate) {
        formData.append('date', chosenDate);
      }
      formData.append('is_anonymous', isAnonymous ? '1' : '0');

      mediaFiles.forEach((file, index) => {
        formData.append(`media_${index}`, {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      });

      await addItem(formData as any);

      setTitle('');
      setDescription('');
      setType(params.type === 'found' ? 'found' : 'lost');
      setDate(null);
      setIsAnonymous(false);
      setMediaFiles([]);

      Alert.alert('Success', 'Item created successfully.');
      router.back();
    } catch {
      Alert.alert('Failed to create item', 'Please check your connection and try again.');
    }
  };

  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading categories and locations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLookupData} activeOpacity={0.88}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#f4f8fc" translucent={false} />
      <KeyboardAvoidingView style={styles.keyboardWrapper} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.heading}>Create a report</Text>
            <Text style={styles.subheading}>Share clear details so the right person can recognize the item quickly.</Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[styles.segmentButton, type === 'lost' && styles.segmentButtonActive]}
                onPress={() => setType('lost')}
                activeOpacity={0.88}
              >
                <Text style={[styles.segmentButtonText, type === 'lost' && styles.segmentButtonTextActive]}>Lost</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, type === 'found' && styles.segmentButtonActive]}
                onPress={() => setType('found')}
                activeOpacity={0.88}
              >
                <Text style={[styles.segmentButtonText, type === 'found' && styles.segmentButtonTextActive]}>Found</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              placeholder="e.g. Black wallet"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              placeholder="Describe important details like color, brand, or where it was seen"
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.textArea]}
            />

            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setCategoryModalVisible(true)} activeOpacity={0.88}>
              <Text style={selectedCategory ? styles.selectButtonText : styles.placeholderText}>
                {selectedCategory ? selectedCategory.name : 'Select a category'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Location</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setLocationModalVisible(true)} activeOpacity={0.88}>
              <Text style={selectedLocation ? styles.selectButtonText : styles.placeholderText}>
                {selectedLocation ? selectedLocation.name : 'Select a location'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setDatePickerVisible(true)} activeOpacity={0.88}>
              <View style={styles.dateRow}>
                <View>
                  <Text style={styles.dateLabel}>Reported date</Text>
                  <Text style={date ? styles.dateValue : styles.placeholderText}>{formatDateLabel(date)}</Text>
                </View>
                <Text style={styles.dateArrow}>{'>'}</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>Media</Text>
            <TouchableOpacity style={styles.pickMediaButton} onPress={pickMedia} activeOpacity={0.88}>
              <Text style={styles.pickMediaButtonText}>Add photo or file</Text>
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
              <Text style={styles.label}>Report anonymously</Text>
              <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (loading || !title.trim()) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.88}
              disabled={loading || !title.trim()}
            >
              <Text style={styles.submitButtonText}>{loading ? 'Creating...' : 'Publish report'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.calendarCard]}>
            <View style={styles.calendarHeader}>
              <View>
                <Text style={styles.modalTitle}>Select date</Text>
                <Text style={styles.modalSubtitle}>Choose the day for this report.</Text>
              </View>
              <TouchableOpacity style={styles.modalHeaderAction} onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.modalHeaderActionText}>Close</Text>
              </TouchableOpacity>
            </View>
            <Calendar
              current={getLocalDateKey(date) || undefined}
              maxDate={getLocalDateKey(new Date())}
              onDayPress={(day) => {
                const todayKey = getLocalDateKey(new Date());
                if (day.dateString > todayKey) {
                  Alert.alert('Invalid date', 'Please select today or a past date.');
                  return;
                }
                const [year, month, dayOfMonth] = day.dateString.split('-').map(Number);
                setDate(new Date(year, month - 1, dayOfMonth));
              }}
              markedDates={date ? { [getLocalDateKey(date)]: { selected: true, selectedColor: '#2563eb' } } : {}}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#64748b',
                selectedDayBackgroundColor: '#2563eb',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#2563eb',
                dayTextColor: '#10233f',
                monthTextColor: '#10233f',
                arrowColor: '#2563eb',
                textDayFontWeight: '600',
                textMonthFontWeight: '700',
                textDayHeaderFontWeight: '700',
              }}
            />
            <View style={styles.calendarActions}>
              <TouchableOpacity style={styles.calendarActionSecondary} onPress={() => setDate(new Date())} activeOpacity={0.88}>
                <Text style={styles.calendarActionSecondaryText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.calendarActionSecondary} onPress={() => setDate(null)} activeOpacity={0.88}>
                <Text style={styles.calendarActionSecondaryText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={categoryModalVisible} transparent animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select category</Text>
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
            <Text style={styles.modalTitle}>Select location</Text>
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
    backgroundColor: '#f4f8fc',
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10233f',
  },
  subheading: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    lineHeight: 21,
    color: '#526175',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#f4f8fc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    color: '#526175',
    fontSize: 15,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 14,
    backgroundColor: '#f8fbff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#10233f',
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    backgroundColor: '#f8fbff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eaf2ff',
  },
  segmentButtonText: {
    color: '#526175',
    fontWeight: '700',
  },
  segmentButtonTextActive: {
    color: '#1d4ed8',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 14,
    backgroundColor: '#f8fbff',
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
  },
  selectButtonText: {
    color: '#10233f',
    fontSize: 15,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 15,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateLabel: {
    color: '#526175',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  dateValue: {
    color: '#10233f',
    fontSize: 15,
    fontWeight: '700',
  },
  dateArrow: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '700',
  },
  pickMediaButton: {
    backgroundColor: '#eef4fb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  pickMediaButtonText: {
    color: '#1e40af',
    fontWeight: '700',
    fontSize: 15,
  },
  mediaList: {
    marginBottom: 14,
  },
  mediaChip: {
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#f8fbff',
  },
  mediaChipText: {
    color: '#10233f',
    marginBottom: 6,
  },
  mediaRemoveText: {
    color: '#dc2626',
    fontWeight: '700',
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
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    maxHeight: '72%',
    width: '100%',
  },
  calendarCard: {
    maxHeight: '85%',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#64748b',
    fontSize: 13,
  },
  modalHeaderAction: {
    backgroundColor: '#f4f8fc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  modalHeaderActionText: {
    color: '#10233f',
    fontSize: 13,
    fontWeight: '700',
  },
  calendarActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  calendarActionSecondary: {
    flex: 1,
    backgroundColor: '#eef4fb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calendarActionSecondaryText: {
    color: '#10233f',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
  },
  modalOptionText: {
    fontSize: 15,
    color: '#10233f',
  },
  modalCloseButton: {
    marginTop: 14,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
