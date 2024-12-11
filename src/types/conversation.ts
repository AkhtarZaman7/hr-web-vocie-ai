export interface ConversationMessage {
  message: string;
  source: 'user' | 'ai';
  timestamp: number;
}

export type ConversationStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'; 