import { memo } from 'react';
import { citedSources, hostLabel, isSafeHttpUrl, type SourceRef } from '@/lib/citations';

interface Props {
  content: string;
  sources: SourceRef[];
}

function SourceListBase({ content, sources }: Props) {
  // This list is plain React, so it never passes through rehypeSanitize — the protocol
  // check that the markdown pipeline gives us for free has to happen here explicitly.
  const cited = citedSources(content, sources).filter((s) => isSafeHttpUrl(s.url));

  if (cited.length === 0) return null;

  return (
    <div className="mt-5 pt-3 border-t border-border/50">
      <div className="text-xs text-muted-foreground/70 mb-2">Sources</div>
      <ol className="space-y-1.5">
        {cited.map((source, i) => (
          <li key={source.url} className="flex gap-2 text-xs leading-5">
            <span className="text-muted-foreground/60 tabular-nums shrink-0">{i + 1}.</span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className="text-muted-foreground hover:text-foreground transition-colors min-w-0"
            >
              <span className="truncate">{source.title}</span>
              <span className="text-muted-foreground/50 ml-1.5">{hostLabel(source.url)}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export const SourceList = memo(SourceListBase);
