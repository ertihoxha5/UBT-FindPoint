import { useCallback, useEffect, useState } from 'react';
import { getMessages, sendMessage } from '../service/chatService';

export function useChatViewModel(conversationId: number) {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const res = await getMessages(conversationId);
      setMessages(res.data);
    } catch (err) {
      console.log('Chat error:', err);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    void load(true);
    const interval = setInterval(() => {
      void load(false);
    }, 2000);
    return () => clearInterval(interval);
  }, [load]);

  const send = async () => {
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage({
        conversation_id: conversationId,
        message: text,
      });

      setText('');
      await load(false);
    } finally {
      setSending(false);
    }
  };

  return { messages, text, setText, send, loading, sending };
}
