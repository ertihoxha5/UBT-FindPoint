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
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCategoryViewModel } from '../../category/viewmodel/useCategoryViewModel';
import { useLocationViewModel } from '../../location/viewmodel/useLocationViewModel';
import type { Category } from '../../category/model/CategoryModel';
import type { Location } from '../../location/model/LocationModel';
import { updateMyItem, useItemViewModel } from '../viewmodel/itemViewModel';

const { width } = Dimensions.get('window');

interface MediaFile {
  uri: string;
  name: string;
  type: string;
}

export default function AddItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    itemId?: string;
    type?: string;
    title?: string;
    description?: string;
    categoryId?: string;
    locationId?: string;
    reward?: string;
    date?: string;
    isAnonymous?: string;
  }>();
  const { addItem, loading } = useItemViewModel();
  const isEditMode = Boolean(params.itemId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'lost' | 'found'>(params.type === 'found' ? 'found' : 'lost');
  const [date, setDate] = useState<Date | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [reward, setReward] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  const getLocalDateKey = (value: Date | null) => {
    if (!value) return '';
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateLabel = (value: Date | null) => {
    if (!value) return 'Choose a date';
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

  useEffect(() => {
    if (!isEditMode) return;

    setTitle(typeof params.title === 'string' ? params.title : '');
    setDescription(typeof params.description === 'string' ? params.description : '');
    setType(params.type === 'found' ? 'found' : 'lost');
    setReward(typeof params.reward === 'string' ? params.reward : '');
    setIsAnonymous(params.isAnonymous === 'true');
    setCategoryId(params.categoryId ? Number(params.categoryId) : null);
    setLocationId(params.locationId ? Number(params.locationId) : null);

    if (typeof params.date === 'string' && params.date) {
      const [year, month, dayOfMonth] = params.date.split('-').map(Number);
      if (year && month && dayOfMonth) {
        setDate(new Date(year, month - 1, dayOfMonth));
      }
    }
  }, [isEditMode, params]);

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
      formData.append('reward', reward.trim());
      formData.append('is_anonymous', isAnonymous ? '1' : '0');

      if (isEditMode) {
        await updateMyItem(Number(params.itemId), {
          title: title.trim(),
          description: description.trim() || '',
          type,
          category_id: categoryId,
          location_id: locationId,
          date: chosenDate || undefined,
          reward: reward.trim() || '',
          is_anonymous: isAnonymous,
        });

        Alert.alert('Success', 'Report updated successfully.');
        router.back();
        return;
      }

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
      setReward('');
      setMediaFiles([]);

      Alert.alert('Success', 'Item created successfully.');
      router.back();
    } catch {
      Alert.alert(isEditMode ? 'Failed to update item' : 'Failed to create item', 'Please check your connection and try again.');
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>Loading categories and locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadLookupData} activeOpacity={0.88}>
            <LinearGradient colors={['#4a90e2', '#357abd']} style={styles.retryGradient}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
      <KeyboardAvoidingView style={styles.keyboardWrapper} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <LinearGradient
              colors={['#f8fafc', '#ffffff']}
              style={styles.headerGradient}
            >
              <View style={styles.iconWrapper}>
                <LinearGradient
                  colors={type === 'lost' ? ['#ff6b6b', '#ee5a52'] : ['#51cf66', '#40c057']}
                  style={styles.headerIcon}
                >
                  <Ionicons 
                    name={type === 'lost' ? 'alert-circle-outline' : 'checkmark-circle-outline'} 
                    size={32} 
                    color="#ffffff" 
                  />
                </LinearGradient>
              </View>
              <Text style={styles.heading}>{isEditMode ? 'Edit Report' : 'Create Report'}</Text>
              <Text style={styles.subheading}>
                {isEditMode
                  ? 'Update the report details you want other users to see.'
                  : 'Share clear details so the right person can recognize the item quickly.'}
              </Text>
            </LinearGradient>

            <View style={styles.section}>
              <Text style={styles.label}>Item Type</Text>
              <View style={styles.segmentRow}>
                <TouchableOpacity
                  style={[styles.segmentButton, type === 'lost' && styles.segmentButtonLostActive]}
                  onPress={() => setType('lost')}
                  activeOpacity={0.88}
                >
                  <Ionicons name="alert-circle-outline" size={20} color={type === 'lost' ? '#ff6b6b' : '#94a3b8'} />
                  <Text style={[styles.segmentButtonText, type === 'lost' && styles.segmentButtonTextActive]}>Lost</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.segmentButton, type === 'found' && styles.segmentButtonFoundActive]}
                  onPress={() => setType('found')}
                  activeOpacity={0.88}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={type === 'found' ? '#51cf66' : '#94a3b8'} />
                  <Text style={[styles.segmentButtonText, type === 'found' && styles.segmentButtonTextActive]}>Found</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Title *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="create-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g., Black wallet, iPhone 14, Student ID"
                  placeholderTextColor="#94a3b8"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  placeholder="Describe important details like color, brand, or where it was seen"
                  placeholderTextColor="#94a3b8"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                  style={[styles.input, styles.textArea]}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity style={styles.selectButton} onPress={() => setCategoryModalVisible(true)} activeOpacity={0.88}>
                  <Ionicons name="folder-outline" size={20} color="#4a90e2" />
                  <Text style={selectedCategory ? styles.selectButtonText : styles.placeholderText}>
                    {selectedCategory ? selectedCategory.name : 'Select category'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Location *</Text>
                <TouchableOpacity style={styles.selectButton} onPress={() => setLocationModalVisible(true)} activeOpacity={0.88}>
                  <Ionicons name="location-outline" size={20} color="#4a90e2" />
                  <Text style={selectedLocation ? styles.selectButtonText : styles.placeholderText}>
                    {selectedLocation ? selectedLocation.name : 'Select location'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity style={styles.selectButton} onPress={() => setDatePickerVisible(true)} activeOpacity={0.88}>
                  <Ionicons name="calendar-outline" size={20} color="#4a90e2" />
                  <Text style={date ? styles.selectButtonText : styles.placeholderText}>
                    {formatDateLabel(date)}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Reward</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="gift-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Optional reward"
                    placeholderTextColor="#94a3b8"
                    value={reward}
                    onChangeText={setReward}
                    style={styles.input}
                  />
                </View>
              </View>
            </View>

            {!isEditMode && (
              <View style={styles.section}>
                <Text style={styles.label}>Media</Text>
                <TouchableOpacity style={styles.pickMediaButton} onPress={pickMedia} activeOpacity={0.88}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#4a90e2" />
                  <Text style={styles.pickMediaButtonText}>Add photo or file</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isEditMode && mediaFiles.length > 0 && (
              <View style={styles.mediaList}>
                {mediaFiles.map((item, index) => (
                  <View key={`${item.uri}-${index}`} style={styles.mediaChip}>
                    <Ionicons name="document-outline" size={16} color="#4a90e2" />
                    <Text style={styles.mediaChipText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => removeMediaFile(index)}>
                      <Ionicons name="close-circle" size={20} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {isEditMode && (
              <View style={styles.editHintCard}>
                <Ionicons name="information-circle-outline" size={20} color="#4a90e2" />
                <Text style={styles.editHintText}>Media attachments stay unchanged while editing this report.</Text>
              </View>
            )}

            <View style={styles.anonymousRow}>
              <View>
                <Text style={styles.label}>Report anonymously</Text>
                <Text style={styles.anonymousHint}>Your name won't appear publicly</Text>
              </View>
              <Switch 
                value={isAnonymous} 
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#e2e8f0', true: '#4a90e2' }}
                thumbColor="#ffffff"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, (loading || !title.trim()) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.88}
              disabled={loading || !title.trim()}
            >
              <LinearGradient
                colors={(!title.trim() || loading) ? ['#cbd5e1', '#cbd5e1'] : ['#4a90e2', '#357abd']}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name={isEditMode ? "save-outline" : "send-outline"} size={20} color="#ffffff" />
                    <Text style={styles.submitButtonText}>
                      {isEditMode ? 'Save changes' : 'Publish report'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select date</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </LinearGradient>
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
              markedDates={date ? { [getLocalDateKey(date)]: { selected: true, selectedColor: '#4a90e2' } } : {}}
              theme={{
                calendarBackground: '#ffffff',
                selectedDayBackgroundColor: '#4a90e2',
                todayTextColor: '#4a90e2',
                arrowColor: '#4a90e2',
              }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionButton} onPress={() => setDate(new Date())}>
                <Text style={styles.modalActionText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionButton} onPress={() => setDate(null)}>
                <Text style={styles.modalActionText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalActionButton, styles.modalActionPrimary]} onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.modalActionPrimaryText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={categoryModalVisible} transparent animationType="fade" onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </LinearGradient>
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
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={locationModalVisible} transparent animationType="fade" onRequestClose={() => setLocationModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <LinearGradient colors={['#ffffff', '#f8fafc']} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select location</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </LinearGradient>
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
                  <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  keyboardWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 108,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#6c8db0',
    fontSize: 15,
  },
  errorText: {
    marginTop: 16,
    color: '#ff6b6b',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  iconWrapper: {
    marginBottom: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#6c8db0',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
  },
  segmentButtonLostActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderColor: '#ff6b6b',
  },
  segmentButtonFoundActive: {
    backgroundColor: 'rgba(81, 207, 102, 0.1)',
    borderColor: '#51cf66',
  },
  segmentButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94a3b8',
  },
  segmentButtonTextActive: {
    color: '#1a3a5c',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a3a5c',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1a3a5c',
  },
  placeholderText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#94a3b8',
  },
  pickMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    borderStyle: 'dashed',
  },
  pickMediaButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4a90e2',
  },
  mediaList: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  mediaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  mediaChipText: {
    flex: 1,
    fontSize: 13,
    color: '#1a3a5c',
  },
  editHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  editHintText: {
    flex: 1,
    fontSize: 13,
    color: '#4a90e2',
  },
  anonymousRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 20,
  },
  anonymousHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  submitButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  modalActionPrimary: {
    backgroundColor: '#4a90e2',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a3a5c',
  },
  modalActionPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1a3a5c',
  },
});