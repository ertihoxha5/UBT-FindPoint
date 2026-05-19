import { useLocalSearchParams } from 'expo-router';
import ChatView from '@/src/features/chat/view/ChatView';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams();

  return <ChatView conversationId={Number(conversationId)} />;
}