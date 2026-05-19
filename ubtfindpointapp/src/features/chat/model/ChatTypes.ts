export type Conversation = {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
};

export type Message = {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  created_at: string;
};