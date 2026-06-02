import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthViewModel } from '@/src/features/auth/viewmodel/AuthViewModel';
import { createConversation } from '@/src/features/chat/service/chatService';
import { deleteMyItem, markMyItemFound } from '@/src/features/items/viewmodel/itemViewModel';

export default function HomeDetailsScreen() {
  const router = useRouter();
  const { getCurrentUser } = useAuthViewModel();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [startingChat, setStartingChat] = useState(false);
  const params = useLocalSearchParams<{
    itemId?: string;
    userId?: string;
    title?: string;
    description?: string;
    type?: string;
    status?: string;
    poster?: string;
    createdAt?: string;
    imageUrl?: string;
    category?: string;
    categoryId?: string;
    location?: string;
    locationId?: string;
    reward?: string;
    date?: string;
    isAnonymous?: string;
    isOwner?: string;
  }>();

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((user) => {
        if (active) {
          setCurrentUserId(user?.userId || user?.id || null);
        }
      })
      .catch(() => {
        if (active) {
          setCurrentUserId(null);
        }
      });

    return () => {
      active = false;
    };
  }, [getCurrentUser]);

  const ownerUserId = params.userId ? Number(params.userId) : null;
  const isOwner = useMemo(() => {
    if (params.isOwner === 'true') {
      return true;
    }

    if (!currentUserId || !ownerUserId) {
      return false;
    }

    return currentUserId === ownerUserId;
  }, [currentUserId, ownerUserId, params.isOwner]);

  const isAnonymous = params.isAnonymous === 'true';
  const canMessage = Boolean(ownerUserId && currentUserId && ownerUserId !== currentUserId && !isAnonymous);

  const infoRows = [
    { label: 'Poster', value: params.poster || 'Unknown user' },
    { label: 'Type', value: params.type || 'Unknown' },
    { label: 'Status', value: params.status || 'Open' },
    { label: 'Category', value: params.category || 'Not set' },
    { label: 'Location', value: params.location || 'Not set' },
    { label: 'Reward', value: params.reward || 'Not set' },
    {
      label: 'Reported',
      value: params.createdAt ? new Date(String(params.createdAt)).toLocaleString() : 'Unknown time',
    },
  ];

  const onDeleteReport = () => {
    if (!params.itemId) {
      return;
    }

    Alert.alert('Delete report', 'This report will be removed permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMyItem(Number(params.itemId));
            router.back();
          } catch {
            Alert.alert('Delete failed', 'Please try again.');
          }
        },
      },
    ]);
  };

  const onMarkFound = async () => {
    if (!params.itemId) {
      return;
    }

    try {
      await markMyItemFound(Number(params.itemId));
      Alert.alert('Updated', 'The report has been marked as found.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch {
      Alert.alert('Update failed', 'Please try again.');
    }
  };

  const onMessageUser = async () => {
    if (!ownerUserId) {
      return;
    }

    try {
      setStartingChat(true);
      const response = await createConversation(ownerUserId);
      const conversationId = response.data?.id;

      if (!conversationId) {
        throw new Error('Missing conversation id');
      }

      router.push({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId: String(conversationId),
          title: params.poster || 'Conversation',
        },
      });
    } catch {
      Alert.alert('Chat unavailable', 'We could not open this conversation right now.');
    } finally {
      setStartingChat(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.heroShell}>
        {params.imageUrl ? <Image source={{ uri: String(params.imageUrl) }} style={styles.image} /> : <View style={styles.imagePlaceholder} />}

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <Text style={styles.typePill}>{String(params.type || 'report').toUpperCase()}</Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{String(params.status || 'open').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.title}>{params.title || 'Report details'}</Text>
          <Text style={styles.description}>{params.description || 'No description was provided for this report.'}</Text>
        </View>
      </View>

      <View style={styles.metaChipRow}>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipLabel}>Category</Text>
          <Text style={styles.metaChipValue}>{params.category || 'Not set'}</Text>
        </View>
        <View style={styles.metaChip}>
          <Text style={styles.metaChipLabel}>Location</Text>
          <Text style={styles.metaChipValue}>{params.location || 'Not set'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Report information</Text>
        {infoRows.map((row) => (
          <View key={row.label} style={styles.tableRow}>
            <Text style={styles.tableLabel}>{row.label}</Text>
            <Text style={styles.tableValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {canMessage ? (
        <TouchableOpacity style={styles.primaryButton} onPress={onMessageUser} activeOpacity={0.88}>
          <Text style={styles.primaryButtonText}>{startingChat ? 'Opening chat...' : 'Message user'}</Text>
        </TouchableOpacity>
      ) : null}

      {isOwner ? (
        <View style={styles.ownerActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() =>
              router.push({
                pathname: '/home/report',
                params: {
                  itemId: params.itemId,
                  title: params.title || '',
                  description: params.description || '',
                  type: params.type || 'lost',
                  categoryId: params.categoryId || '',
                  locationId: params.locationId || '',
                  reward: params.reward || '',
                  date: params.date || '',
                  isAnonymous: params.isAnonymous || 'false',
                },
              })
            }
            activeOpacity={0.88}>
            <Text style={styles.secondaryButtonText}>Edit report</Text>
          </TouchableOpacity>

          {params.status !== 'resolved' ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={onMarkFound} activeOpacity={0.88}>
              <Text style={styles.secondaryButtonText}>Mark as found</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={styles.dangerButton} onPress={onDeleteReport} activeOpacity={0.88}>
            <Text style={styles.dangerButtonText}>Delete report</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.88}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf4f8',
  },
  content: {
    padding: 16,
    paddingBottom: 108,
  },
  heroShell: {
    marginBottom: 14,
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 28,
    backgroundColor: '#dbe7f3',
  },
  imagePlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: 28,
    backgroundColor: '#dbe7f3',
  },
  heroCard: {
    marginTop: -44,
    marginHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#eef4fb',
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPill: {
    backgroundColor: '#f8fbff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  statusPillText: {
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: '800',
    color: '#10233f',
  },
  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: '#526175',
  },
  metaChipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metaChip: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  metaChipLabel: {
    color: '#6b7b91',
    fontSize: 12,
    fontWeight: '700',
  },
  metaChipValue: {
    color: '#10233f',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    marginBottom: 14,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#10233f',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef3f8',
  },
  tableLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#526175',
  },
  tableValue: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
    color: '#10233f',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  ownerActions: {
    gap: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7f3',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1e40af',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  backButtonText: {
    color: '#10233f',
    fontSize: 16,
    fontWeight: '700',
  },
});
