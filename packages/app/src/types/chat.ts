export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

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
};

export type ChatContextValue = ChatState & ChatActions;
