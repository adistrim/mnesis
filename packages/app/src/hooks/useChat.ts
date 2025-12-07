import { useContext } from 'react';
import { ChatContext } from '@/context/ChatContext';
import type { ChatContextValue } from '@/types/chat.type';

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return ctx;
}
