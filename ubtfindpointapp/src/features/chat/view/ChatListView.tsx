import React from 'react';
import { FlatList, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useChatListViewModel } from '../viewmodel/useChatListViewModel';

type ChatItem = {
  id: number;
};

export default function ChatListView() {
  const router = useRouter();
  const userId = 1;

  const { chats } = useChatListViewModel(userId);

  return (
    <FlatList
      data={chats}
      keyExtractor={(item: ChatItem) => item.id.toString()}
      renderItem={({ item }: { item: ChatItem }) => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/chat/[conversationId]',
              params: { conversationId: item.id.toString() },
            })
          }
          style={{ padding: 16 }}
        >
          <Text>Conversation #{item.id}</Text>
        </TouchableOpacity>
      )}
    />
  );
}