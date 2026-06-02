import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthViewModel } from '../../auth/viewmodel/AuthViewModel';
import { useChatViewModel } from '../viewmodel/useChatViewModel';

export default function ChatView({ conversationId }: { conversationId: number }) {
  const { getCurrentUser } = useAuthViewModel();
  const [userId, setUserId] = useState<number | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList<any>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const { messages, text, setText, send, loading, sending } = useChatViewModel(conversationId);

  useEffect(() => {
    let active = true;

    getCurrentUser()
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

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

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
  }, [fadeAnim, getCurrentUser]);

  useEffect(() => {
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
              colors={['#7db4ff', '#2f6fb8']}
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
      <StatusBar style="light" backgroundColor="#10243d" />

      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <LinearGradient
        colors={['#10243d', '#1e4f7a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.headerPill}>
              <View style={styles.headerPillDot} />
              <Text style={styles.headerPillText}>Private chat</Text>
            </View>
            <Text style={styles.headerTitle}>Conversation</Text>
            <Text style={styles.headerSubtitle}>
              {messages.length} message{messages.length === 1 ? '' : 's'} in this thread
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
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
              <LinearGradient colors={['#ffffff', '#edf4ff']} style={styles.emptyCard}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="chatbubble-ellipses-outline" size={28} color="#2f6fb8" />
                </View>
                <Text style={styles.emptyTitle}>Start the conversation</Text>
                <Text style={styles.emptyText}>
                  Send the first message and keep everything in one clean thread.
                </Text>
              </LinearGradient>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.composerWrap, keyboardVisible && styles.composerWrapKeyboardVisible]}>
          <View style={styles.composer}>
            <View style={styles.inputContainer}>
              <TouchableOpacity 
                style={styles.attachButton}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color="#2f6fb8" />
              </TouchableOpacity>
              
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Write a message..."
                placeholderTextColor="#8aa0ba"
                style={styles.input}
                multiline
                maxLength={500}
                editable={!sending}
              />
              
              <TouchableOpacity 
                style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]} 
                onPress={handleSend} 
                disabled={!text.trim() || sending}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={(!text.trim() || sending) ? ['#c5d4e8', '#c5d4e8'] : ['#2f6fb8', '#174b83']}
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
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#eef4fb',
  },
  helperText: {
    marginTop: 12,
    color: '#6c8db0',
    fontSize: 15,
    textAlign: 'center',
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(47, 111, 184, 0.10)',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: 120,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16, 36, 61, 0.06)',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#10243d',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
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
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginBottom: 8,
  },
  headerPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94f0b4',
  },
  headerPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyCard: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#10243d',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 111, 184, 0.10)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#17324f',
    marginTop: 14,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c8db0',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  messageRow: {
    marginBottom: 14,
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
    maxWidth: '78%',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  messageBubbleMine: {
    backgroundColor: '#2f6fb8',
    borderBottomRightRadius: 8,
  },
  messageBubbleOther: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 8,
  },
  senderName: {
    color: '#2f6fb8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  messageText: {
    color: '#1a3a5c',
    fontSize: 15.5,
    lineHeight: 21,
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
  composerWrap: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 18 : 14,
    backgroundColor: 'rgba(238, 244, 251, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(194, 211, 228, 0.65)',
  },
  composerWrapKeyboardVisible: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
  },
  composer: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    shadowColor: '#10243d',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
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
    backgroundColor: 'rgba(47, 111, 184, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d9e5f2',
    backgroundColor: '#f7fbff',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
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
    opacity: 0.65,
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
    marginRight: 6,
  },
});
