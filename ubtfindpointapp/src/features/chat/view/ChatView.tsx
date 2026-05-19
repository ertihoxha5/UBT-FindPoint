import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthViewModel } from '../../auth/viewmodel/AuthViewModel';
import { useChatViewModel } from '../viewmodel/useChatViewModel';

export default function ChatView({ conversationId }: { conversationId: number }) {
  const auth = useAuthViewModel();
  const [userId, setUserId] = useState<number | null>(null);
  const { messages, text, setText, send } = useChatViewModel(conversationId);

  useEffect(() => {
    let active = true;

    auth
      .getCurrentUser()
      .then((user) => {
        if (active) {
          setUserId(user.userId);
        }
      })
      .catch(() => {
        if (active) {
          setUserId(null);
        }
      });

    return () => {
      active = false;
    };
  }, [auth]);

  if (!conversationId) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.helperText}>This conversation could not be opened.</Text>
      </View>
    );
  }

  if (userId === null) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.helperText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Conversation</Text>
        <Text style={styles.topBarSubtitle}>Reply quickly and keep item updates clear.</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.messagesContent}
        renderItem={({ item }: any) => {
          const mine = item.sender_id === userId;
          return (
            <View style={[styles.messageRow, mine ? styles.messageRowMine : styles.messageRowOther]}>
              <View style={[styles.messageBubble, mine ? styles.messageBubbleMine : styles.messageBubbleOther]}>
                {!mine ? <Text style={styles.senderName}>{item.sender_name || 'User'}</Text> : null}
                <Text style={[styles.messageText, mine && styles.messageTextMine]}>{item.message}</Text>
                <Text style={[styles.messageMeta, mine && styles.messageMetaMine]}>
                  {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No messages yet. Start the conversation below.</Text>}
      />

      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write a message..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />
        <TouchableOpacity style={styles.sendButton} onPress={send} activeOpacity={0.88}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf4f8',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f4f8fc',
  },
  helperText: {
    marginTop: 12,
    color: '#526175',
    fontSize: 15,
    textAlign: 'center',
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 18,
    flexGrow: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    color: '#10233f',
    fontSize: 25,
    fontWeight: '800',
  },
  topBarSubtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  emptyText: {
    color: '#526175',
    textAlign: 'center',
    marginTop: 36,
    fontSize: 15,
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  messageBubbleMine: {
    backgroundColor: '#2563eb',
  },
  messageBubbleOther: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe7f3',
  },
  senderName: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    color: '#10233f',
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextMine: {
    color: '#ffffff',
  },
  messageMeta: {
    color: '#6b7b91',
    fontSize: 11,
    marginTop: 8,
  },
  messageMetaMine: {
    color: '#dbeafe',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 22,
    borderTopWidth: 1,
    borderTopColor: '#dbe7f3',
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 110,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#dbe7f3',
    backgroundColor: '#f7fbff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#10233f',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
