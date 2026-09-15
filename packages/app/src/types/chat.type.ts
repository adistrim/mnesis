export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  isStreaming?: boolean;
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

export type ModelOption = {
  id: string;
  label: string;
  isDefault: boolean;
};

export type ChatState = {
  messages: Message[];
  input: string;
  sessionId?: string;
  models: ModelOption[];
  model?: string;
  toolStatus?: string;
  isLoading: boolean;
  isSessionLoading: boolean;
  error: string | null;
};

export type ChatActions = {
  setInput: (value: string) => void;
  setModel: (model: string) => void;
  newSession: () => void;
  submit: () => Promise<void>;
  stop: () => void;
  loadSession: (sessionId: string) => Promise<void>;
  setRefetchSessions: (refetch: () => void) => void;
};

export type ChatContextValue = ChatState & ChatActions;
