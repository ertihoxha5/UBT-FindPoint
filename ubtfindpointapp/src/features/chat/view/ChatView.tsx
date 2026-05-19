import React from 'react';
import { View, FlatList, TextInput, Button, Text } from 'react-native';
import { useChatViewModel } from '../viewmodel/useChatViewModel';

export default function ChatView({ conversationId }: any) {
  const userId = 1;

  const { messages, text, setText, send } =
    useChatViewModel(conversationId, userId);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={messages}
        keyExtractor={(i: any) => i.id.toString()}
        renderItem={({ item }: any) => (
          <Text style={{ marginVertical: 4 }}>
            {item.sender_id === userId ? 'Me: ' : 'User: '}
            {item.message}
          </Text>
        )}
      />

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Shkruaj mesazh..."
        style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
      />

      <Button title="Send" onPress={send} />
    </View>
  );
}