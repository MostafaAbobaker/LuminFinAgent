import { ChatSource } from "./chat-source";

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
  sources?: ChatSource[];
}
