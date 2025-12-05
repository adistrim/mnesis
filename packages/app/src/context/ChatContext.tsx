import { createContext } from 'react';
import type { ChatContextValue } from '@/types/chat';

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);
