import type { LLMRequestType } from '@/types/chat.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  type: LLMRequestType;
  isLoading: boolean;
  setType: (t: LLMRequestType) => void;
}

export function Header({ type, isLoading, setType }: Props) {
  return (
    <div className="bg-inherit px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="type-select" className="sr-only">Select Mode</label>
          <Select
            value={type}
            onValueChange={(v: LLMRequestType) => setType(v)}
            disabled={isLoading}
          >
            <SelectTrigger id="type-select" className="w-36">
              <SelectValue placeholder="Select Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="reasoning">Reasoning</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
