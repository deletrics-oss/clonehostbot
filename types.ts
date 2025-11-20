export interface Session {
  id: string;
  status: 'INITIALIZING' | 'QR_PENDING' | 'READY' | 'ERROR' | 'OFFLINE' | 'DESTROYING';
}

export interface Message {
  from: string;
  to?: string;
  body: string;
  timestamp: string;
  isMine?: boolean;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  unreadCount: number;
}

export interface LogicFile {
  name: string;
  content?: string;
}

export interface StripeProduct {
  id: string;
  name: string;
  price: string;
  features: string[];
  key: string;
}

export interface User {
  username: string;
  token: string;
  plan: 'free' | 'basic' | 'pro';
}