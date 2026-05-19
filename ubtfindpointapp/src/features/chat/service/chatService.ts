import api from '../../../services/api';

export const getConversations = (userId: number) =>
  api.get(`/chat/conversations/${userId}`);

export const getMessages = (conversationId: number) =>
  api.get(`/chat/messages/${conversationId}`);

export const sendMessage = (data: {
  conversation_id: number;
  sender_id: number;
  message: string;
}) => api.post('/chat/messages', data);