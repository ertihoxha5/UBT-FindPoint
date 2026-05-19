import api from '../../../services/api';

export const getConversations = () => api.get('/chat/conversations');

export const createConversation = (participantId: number) =>
  api.post('/chat/conversations', { participantId });

export const getMessages = (conversationId: number) =>
  api.get(`/chat/messages/${conversationId}`);

export const sendMessage = (data: {
  conversation_id: number;
  message: string;
}) => api.post('/chat/messages', data);
