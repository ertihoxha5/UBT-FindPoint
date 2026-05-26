import React, { useEffect, useState, useRef } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthViewModel } from '../../auth/viewmodel/AuthViewModel';
import { useChatViewModel } from '../viewmodel/useChatViewModel';

export default function ChatView({ conversationId }: { conversationId: number }) {
  const auth = useAuthViewModel();
  const [userId, setUserId] = useState<number | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { messages, text, setText, send, loading, sending } = useChatViewModel(conversationId);

  useEffect(() => {
    let active = true;

    auth
      .getCurrentUser()
      .then((user) => {
        if (active) {
          setUserId(user?.userId || user?.id || null);
          setAuthResolved(true);
        }
      })
      .catch(() => {
        if (active) {
          setUserId(null);
          setAuthResolved(true);
        }
      });

    // Animate entrance
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      active = false;
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [auth]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (text.trim() && !sending) {
      send();
    }
  };

  const renderMessage = ({ item }: any) => {
    const mine = item.sender_id === userId;
    
    return (
      <Animated.View 
        style={[
          styles.messageRow, 
          mine ? styles.messageRowMine : styles.messageRowOther,
          { opacity: fadeAnim }
        ]}
      >
        {!mine && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#4a90e2', '#357abd']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {(item.sender_name || 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
        )}
        
        <View style={[styles.messageBubble, mine ? styles.messageBubbleMine : styles.messageBubbleOther]}>
          {!mine && (
            <Text style={styles.senderName}>{item.sender_name || 'User'}</Text>
          )}
          <Text style={[styles.messageText, mine && styles.messageTextMine]}>
            {item.message}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[styles.messageMeta, mine && styles.messageMetaMine]}>
              {item.created_at 
                ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''
              }
            </Text>
            {mine && (
              <Ionicons 
                name="checkmark-done" 
                size={14} 
                color={item.read ? '#51cf66' : '#94a3b8'} 
              />
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  if (!conversationId) {
    return (
      <View style={styles.centerState}>
        <Ionicons name="chatbubble-ellipses-outline" size={64} color="#cbd5e1" />
        <Text style={styles.helperText}>Conversation not available</Text>
      </View>
    );
  }

  if (!authResolved || loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.helperText}>Loading conversation...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#f0f7ff" />
      
      {/* Header */}
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#1a3a5c" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Chat</Text>
            <Text style={styles.headerSubtitle}>
              {messages.length} messages
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#4a90e2" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.messagesContent}
          renderItem={renderMessage}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Start the conversation by sending a message below
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Composer */}
        <View style={[styles.composer, keyboardVisible && styles.composerKeyboardVisible]}>
          <View style={styles.inputContainer}>
            <TouchableOpacity 
              style={styles.attachButton}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={28} color="#4a90e2" />
            </TouchableOpacity>
            
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              style={styles.input}
              multiline
              maxLength={500}
              editable={!sending}
            />
            
            <TouchableOpacity 
              style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]} 
              onPress={handleSend} 
              disabled={!text.trim() || sending}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={(!text.trim() || sending) ? ['#cbd5e1', '#cbd5e1'] : ['#4a90e2', '#357abd']}
                style={styles.sendGradient}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="send" size={18} color="#ffffff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.charCount}>
            {text.length}/500
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f0f7ff',
  },
  helperText: {
    marginTop: 12,
    color: '#6c8db0',
    fontSize: 15,
    textAlign: 'center',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6c8db0',
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#cbd5e1',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowMine: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 4,
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  messageBubbleMine: {
    backgroundColor: '#4a90e2',
  },
  messageBubbleOther: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  senderName: {
    color: '#4a90e2',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  messageText: {
    color: '#1a3a5c',
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#ffffff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 6,
  },
  messageMeta: {
    color: '#6c8db0',
    fontSize: 10,
  },
  messageMetaMine: {
    color: 'rgba(255,255,255,0.7)',
  },
  composer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
  },
  composerKeyboardVisible: {
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#1a3a5c',
    fontSize: 15,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  charCount: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 6,
    marginRight: 4,
  },
});
