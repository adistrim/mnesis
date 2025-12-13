export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export interface Session {
  id: string;
  title: string;
  createdAt: string;
}

export type SessionListResponse = Session[];

export const ROLE = {
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
} as const;

export type LLMRequestType = 'chat' | 'reasoning';

export type ChatState = {
  messages: Message[];
  input: string;
  sessionId?: string;
  type: LLMRequestType;
  isLoading: boolean;
  error: string | null;
};

export type ChatActions = {
  setInput: (value: string) => void;
  setType: (type: LLMRequestType) => void;
  newSession: () => void;
  submit: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  setRefetchSessions: (refetch: () => void) => void;
};

export type ChatContextValue = ChatState & ChatActions;
