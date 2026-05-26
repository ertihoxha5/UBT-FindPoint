import React, { useRef, useEffect } from 'react';
import { 
  ActivityIndicator, 
  FlatList, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  Animated,
  Dimensions 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatListViewModel } from '../viewmodel/useChatListViewModel';

const { width } = Dimensions.get('window');

type ChatItem = {
  id: number;
  other_user_id?: number;
  other_user_name?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
};

export default function ChatListView() {
  const router = useRouter();
  const { chats, loading } = useChatListViewModel();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderChatItem = ({ item, index }: { item: ChatItem; index: number }) => {
    const delay = index * 100;
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }],
        }}
      >
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
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#ffffff', '#f8fafc']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#4a90e2', '#357abd']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {(item.other_user_name || 'C').slice(0, 1).toUpperCase()}
                  </Text>
                </LinearGradient>
                {item.unread_count && item.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {item.unread_count > 99 ? '99+' : item.unread_count}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.textWrap}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.other_user_name || `Conversation #${item.id}`}
                  </Text>
                  <Text style={styles.time}>
                    {formatTime(item.last_message_at)}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Ionicons 
                    name={item.last_message ? "chatbubble-outline" : "chatbubble-ellipses-outline"} 
                    size={14} 
                    color="#94a3b8" 
                  />
                  <Text style={styles.preview} numberOfLines={1}>
                    {item.last_message || 'Tap to start chatting'}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && !chats.length) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.helperText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#f0f7ff" translucent={false} />
      
      {/* Header */}
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="chatbubbles" size={28} color="#4a90e2" />
            <Text style={styles.headerTitle}>Messages</Text>
          </View>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => router.push('/items' as never)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={22} color="#4a90e2" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          {chats.length} conversation{chats.length !== 1 ? 's' : ''}
        </Text>
      </LinearGradient>

      <FlatList
        data={chats}
        keyExtractor={(item: ChatItem) => item.id.toString()}
        contentContainerStyle={styles.content}
        renderItem={renderChatItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={64} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Open a lost or found item report and message the poster to start a conversation
            </Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/items' as never)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#4a90e2', '#357abd']}
                style={styles.browseGradient}
              >
                <Ionicons name="search-outline" size={20} color="#ffffff" />
                <Text style={styles.browseButtonText}>Browse Items</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f0f7ff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a3a5c',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6c8db0',
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 24,
  },
  helperText: {
    marginTop: 12,
    color: '#6c8db0',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a3a5c',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c8db0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  browseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  textWrap: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a3a5c',
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 11,
    color: '#94a3b8',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: '#6c8db0',
    lineHeight: 18,
  },
});
