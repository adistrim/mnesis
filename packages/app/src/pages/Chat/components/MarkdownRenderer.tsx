import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { createContext, memo, useContext, useMemo, useState } from "react";
import { citedSources, hostLabel, normalizeUrl, type SourceRef } from "@/lib/citations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
    content: string;
    sources?: SourceRef[];
}

/** Context, not a prop, so the module-level `components` object stays referentially
 *  stable and the memoization the streaming path relies on is preserved. */
type Citation = { index: number; title: string; url: string };

const CitationContext = createContext<Map<string, Citation>>(new Map());

/** Only a link whose entire label is a bare number is a citation. Without this guard a
 *  normal link like [Reuters](url) — or a bare autolinked URL that remark-gfm turns into
 *  an anchor — would have its text replaced by a number. */
function numericLabel(children: React.ReactNode): string | undefined {
    const single =
        typeof children === "string"
            ? children
            : Array.isArray(children) && children.length === 1 && typeof children[0] === "string"
              ? children[0]
              : undefined;
    if (single === undefined) return undefined;
    const label = single.trim();
    return /^\d{1,3}$/.test(label) ? label : undefined;
}

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw, rehypeSanitize];

function CodeBlockBase({ language, code }: { language?: string; code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-lg overflow-hidden">
            <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between border-b border-zinc-700">
                <span className="text-xs text-zinc-400 font-mono">
                    {language || "text"}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    aria-label="Copy code"
                    className="h-auto gap-1.5 px-2 py-1 text-xs font-normal text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </Button>
            </div>
            <SyntaxHighlighter
                style={oneDark}
                language={language || "text"}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    borderRadius: '0 0 0.5rem 0.5rem',
                    fontSize: '0.875rem',
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}


const CodeBlock = memo(CodeBlockBase);

function CitationAwareLink({ href, children }: { href?: string; children: React.ReactNode }) {
    const index = useContext(CitationContext);
    const label = numericLabel(children);
    const citation = href && label ? index.get(normalizeUrl(href)) : undefined;

    if (citation) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge
                        asChild
                        variant="secondary"
                        className="align-super min-w-[1.05rem] h-[1.05rem] px-1 ml-0.5 text-[0.65rem] leading-none tabular-nums no-underline hover:bg-primary/15 hover:text-primary"
                    >
                        <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow ugc"
                        >
                            {citation.index}
                        </a>
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <span className="block font-medium">{citation.title}</span>
                    <span className="block opacity-70">{hostLabel(citation.url)}</span>
                </TooltipContent>
            </Tooltip>
        );
    }

    // A bare-number label that resolves to nothing was meant as a citation but points
    // somewhere we never retrieved. Showing the host beats showing a naked "9".
    const fallback = label && href ? hostLabel(href) : children;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        >
            {fallback}
        </a>
    );
}

const components: Components = {
    // Headings
    h1({ children }) {
        return (
            <h1 className="text-2xl font-bold mt-6 mb-4 pb-2 border-b border-border first:mt-0">
                {children}
            </h1>
        );
    },

    h2({ children }) {
        return (
            <h2 className="text-xl font-semibold mt-6 mb-3 pb-1 border-b border-border/50 first:mt-0">
                {children}
            </h2>
        );
    },

    h3({ children }) {
        return (
            <h3 className="text-lg font-semibold mt-5 mb-2 first:mt-0">
                {children}
            </h3>
        );
    },

    h4({ children }) {
        return (
            <h4 className="text-base font-semibold mt-4 mb-2 first:mt-0">
                {children}
            </h4>
        );
    },

    // Paragraphs
    p({ children }) {
        return (
            <p className="my-3 leading-7 first:mt-0 last:mb-0">
                {children}
            </p>
        );
    },

    // Lists
    ul({ children }) {
        return (
            <ul className="my-3 ml-6 list-disc space-y-1.5 marker:text-muted-foreground">
                {children}
            </ul>
        );
    },

    ol({ children }) {
        return (
            <ol className="my-3 ml-6 list-decimal space-y-1.5 marker:text-muted-foreground marker:font-medium">
                {children}
            </ol>
        );
    },

    li({ children }) {
        return (
            <li className="leading-7 pl-1">
                {children}
            </li>
        );
    },

    // Blockquotes
    blockquote({ children }) {
        return (
            <blockquote className="my-4 border-l-4 border-primary/50 bg-muted/30 pl-4 py-2 pr-3 italic text-muted-foreground rounded-r-md">
                {children}
            </blockquote>
        );
    },

    // Code blocks and inline code
    code({ className, children }) {
        const match = /language-(\w+)/.exec(className || "");
        const codeContent = String(children).replace(/\n$/, "");
        const isCodeBlock = match || codeContent.includes('\n');

        if (isCodeBlock) {
            return <CodeBlock language={match?.[1]} code={codeContent} />;
        }

        return (
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary/90 border border-border/50">
                {children}
            </code>
        );
    },

    // Pre wrapper (for code blocks)
    pre({ children }) {
        return <>{children}</>;
    },

    // Tables
    table({ children }) {
        return (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                    {children}
                </table>
            </div>
        );
    },

    thead({ children }) {
        return (
            <thead className="bg-muted/50">
                {children}
            </thead>
        );
    },

    tbody({ children }) {
        return (
            <tbody className="divide-y divide-border bg-card">
                {children}
            </tbody>
        );
    },

    tr({ children }) {
        return (
            <tr className="hover:bg-muted/30 transition-colors">
                {children}
            </tr>
        );
    },

    th({ children }) {
        return (
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                {children}
            </th>
        );
    },

    td({ children }) {
        return (
            <td className="px-4 py-3 text-sm text-muted-foreground">
                {children}
            </td>
        );
    },

    // Links
    a({ href, children }) {
        return <CitationAwareLink href={href}>{children}</CitationAwareLink>;
    },

    // Text formatting
    strong({ children }) {
        return (
            <strong className="font-semibold text-foreground">
                {children}
            </strong>
        );
    },

    em({ children }) {
        return (
            <em className="italic">
                {children}
            </em>
        );
    },

    // Horizontal rule
    hr() {
        return <hr className="my-6 border-t border-border" />;
    },
};

function MarkdownRendererBase({ content, sources }: MarkdownRendererProps) {
    const index = useMemo(() => {
        const cited = citedSources(content, sources ?? []);
        return new Map(
            cited.map((s, i) => [
                normalizeUrl(s.url),
                { index: i + 1, title: s.title, url: s.url },
            ]),
        );
    }, [content, sources]);

    return (
        <CitationContext.Provider value={index}>
        <div className="prose-container text-foreground">
            <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
        </CitationContext.Provider>
    );
}

export const MarkdownRenderer = memo(MarkdownRendererBase);
