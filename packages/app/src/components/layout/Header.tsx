import type { ModelOption } from '@/types/chat.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  models: ModelOption[];
  model?: string;
  isLoading: boolean;
  setModel: (m: string) => void;
}

export function Header({ models, model, isLoading, setModel }: Props) {
  return (
    <div className="bg-inherit px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="model-select" className="sr-only">Select Model</label>
          <Select
            value={model ?? ''}
            onValueChange={setModel}
            disabled={isLoading || models.length === 0}
          >
            <SelectTrigger id="model-select" className="w-36">
              <SelectValue placeholder={models.length === 0 ? 'Loading' : 'Select Model'} />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
