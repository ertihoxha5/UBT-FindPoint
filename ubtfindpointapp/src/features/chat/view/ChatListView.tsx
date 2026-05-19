import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useChatListViewModel } from '../viewmodel/useChatListViewModel';

type ChatItem = {
  id: number;
  other_user_id?: number;
  other_user_name?: string;
  last_message?: string;
  last_message_at?: string;
};

export default function ChatListView() {
  const router = useRouter();
  const { chats, loading } = useChatListViewModel();

  if (loading && !chats.length) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.helperText}>Loading your conversations...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={chats}
      keyExtractor={(item: ChatItem) => item.id.toString()}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Conversations</Text>
          <Text style={styles.heroTitle}>Your messages, organized for quick replies.</Text>
          <Text style={styles.heroSubtitle}>Open any report, start a conversation, and keep lost-and-found updates in one place.</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No conversations yet. Open a report and message the poster to start chatting.</Text>}
      renderItem={({ item }: { item: ChatItem }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/chat/[conversationId]',
              params: {
                conversationId: item.id.toString(),
                title: item.other_user_name || 'Conversation',
              },
            })
          }
          style={styles.card}
          activeOpacity={0.88}
        >
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.other_user_name || 'C').slice(0, 1).toUpperCase()}</Text>
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.name}>{item.other_user_name || `Conversation #${item.id}`}</Text>
              <Text style={styles.preview} numberOfLines={2}>
                {item.last_message || 'No messages yet.'}
              </Text>
            </View>
          </View>
          <Text style={styles.meta}>
            {item.last_message_at ? new Date(item.last_message_at).toLocaleString() : 'Ready to chat'}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 108,
    backgroundColor: '#edf4f8',
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f8fc',
    paddingHorizontal: 24,
  },
  helperText: {
    marginTop: 12,
    color: '#526175',
    fontSize: 15,
  },
  emptyText: {
    color: '#526175',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 40,
  },
  heroCard: {
    backgroundColor: '#10233f',
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
  },
  eyebrow: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginTop: 10,
  },
  heroSubtitle: {
    color: '#d8e6f5',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  textWrap: {
    flex: 1,
  },
  name: {
    color: '#10233f',
    fontSize: 17,
    fontWeight: '800',
  },
  preview: {
    color: '#526175',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  meta: {
    color: '#6b7b91',
    fontSize: 12,
    marginTop: 10,
  },
});
