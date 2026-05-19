import { useEffect, useState } from 'react';
import { getConversations } from '../service/chatService';

export function useChatListViewModel(userId: number) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getConversations(userId);
      setChats(res.data);
    } catch (err) {
      console.log('Chat list error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  return { chats, loading, refresh: load };
}