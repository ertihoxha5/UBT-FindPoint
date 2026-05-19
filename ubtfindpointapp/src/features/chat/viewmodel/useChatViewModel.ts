import { useEffect, useState } from 'react';
import { getMessages, sendMessage } from '../service/chatService';

export function useChatViewModel(conversationId: number, userId: number) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  const load = async () => {
    try {
      const res = await getMessages(conversationId);
      setMessages(res.data);
    } catch (err) {
      console.log('Chat error:', err);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [conversationId]);

  const send = async () => {
    if (!text.trim()) return;

    await sendMessage({
      conversation_id: conversationId,
      sender_id: userId,
      message: text,
    });

    setText('');
    load();
  };

  return { messages, text, setText, send };
}