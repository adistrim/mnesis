import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  error: string | null;
}

export function ChatError({ error }: Props) {
  if (!error) return null;

  return (
    <div className="px-6 pb-4">
      <div className="max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
