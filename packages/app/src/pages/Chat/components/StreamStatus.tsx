import { Globe, FileText, Loader2 } from 'lucide-react';

const TOOL_META: Record<string, { label: string; Icon: typeof Globe }> = {
  web_search: { label: 'Searching the web', Icon: Globe },
  fetch_web_content: { label: 'Reading the page', Icon: FileText },
};

interface Props {
  tool?: string;
}

/** Fills the gap before the first token, and marks tool work while it runs. */
export function StreamStatus({ tool }: Props) {
  const meta = tool
    ? (TOOL_META[tool] ?? { label: 'Working', Icon: Loader2 })
    : { label: 'Thinking', Icon: Loader2 };

  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <meta.Icon
        className={`w-3.5 h-3.5 shrink-0 text-muted-foreground ${tool ? '' : 'animate-spin'}`}
      />
      <span className="shimmer-text font-medium">{meta.label}</span>
    </div>
  );
}
