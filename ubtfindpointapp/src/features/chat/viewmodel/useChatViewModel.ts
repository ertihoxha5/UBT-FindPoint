import { useCallback, useEffect, useState } from 'react';
import { getMessages, sendMessage } from '../service/chatService';

export function useChatViewModel(conversationId: number) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await getMessages(conversationId);
      setMessages(res.data);
    } catch (err) {
      console.log('Chat error:', err);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [load]);

  const send = async () => {
    if (!text.trim()) return;

    await sendMessage({
      conversation_id: conversationId,
      message: text,
    });

    setText('');
    load();
  };

  return { messages, text, setText, send };
}
