import { createContext } from 'react';
import type { ChatContextValue } from '@/types/chat.type';

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);
