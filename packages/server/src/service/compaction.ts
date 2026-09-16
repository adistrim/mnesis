import { settings } from "@/config/settings";
import {
    appendMemorySegment,
    type MemorySegment,
} from "@/db/repository/session-memory";
import type { SessionExchange } from "@/db/types";
import { genLLMText } from "@/lib/openai/openai";
import { getDefaultModel } from "@/lib/openai/models";
import { COMPACT_SECTIONS, compactContext } from "@/prompts";

const SUMMARISE_TIMEOUT_MS = 30_000;

/** Cheap proxy; the threshold is a heuristic, so a tokenizer would be false precision. */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

function exchangeTokens(exchange: SessionExchange): number {
    return (
        estimateTokens(exchange.user?.content ?? "") +
        estimateTokens(exchange.ai?.content ?? "")
    );
}

export type CompactionPlan = {
    /** Exchanges to fold into a new segment, oldest first. */
    span: SessionExchange[];
    fromUserMessageId: number;
    throughUserMessageId: number;
    seq: number;
};

/**
 * Decides whether to compact and how much. The tail is chosen by token budget rather than
 * a fixed exchange count: a handful of long tool-backed answers can exceed the trigger on
 * their own, which with a fixed count would compact on every single turn — worse than not
 * compacting at all, because each one also invalidates the prompt cache.
 */
export function planCompaction(
    tail: SessionExchange[],
    segments: MemorySegment[],
): CompactionPlan | null {
    const total = tail.reduce((sum, ex) => sum + exchangeTokens(ex), 0);
    if (total <= settings.COMPACT_TRIGGER_TOKENS) return null;

    // Walk back from the newest, keeping exchanges until the target budget is reached.
    // Everything older than that becomes the span to summarise.
    let kept = 0;
    let keepFrom = tail.length;
    for (let i = tail.length - 1; i >= 0; i--) {
        const cost = exchangeTokens(tail[i]!);
        if (kept > 0 && kept + cost > settings.COMPACT_TARGET_TOKENS) break;
        kept += cost;
        keepFrom = i;
    }

    // Always leave the most recent exchange verbatim, even if it alone blows the budget.
    if (keepFrom >= tail.length) keepFrom = tail.length - 1;

    const span = tail.slice(0, keepFrom).filter((ex) => ex.user && ex.ai);
    if (span.length < settings.COMPACT_MIN_EXCHANGES) return null;

    const first = span[0]!;
    const last = span[span.length - 1]!;

    return {
        span,
        fromUserMessageId: first.user.id,
        throughUserMessageId: last.user.id,
        seq: (segments[segments.length - 1]?.seq ?? 0) + 1,
    };
}

function renderSpan(span: SessionExchange[]): string {
    return span
        .map((ex) => `User: ${ex.user.content}\nAssistant: ${ex.ai?.content ?? ""}`)
        .join("\n\n");
}

/**
 * A bad summary is permanent and silently poisons every later turn, so anything doubtful
 * is rejected and the span simply stays verbatim until the next attempt.
 */
export function isUsableSummary(summary: string, sourceChars: number): boolean {
    const text = summary.trim();
    if (text.length < 80) return false;
    // Echoed the transcript instead of compressing it.
    if (text.length > sourceChars * 0.5) return false;
    // Structural check: catches refusals and meta-commentary far more reliably than
    // scanning for refusal phrases.
    return COMPACT_SECTIONS.every((section) => text.includes(`${section}:`));
}

const inFlight = new Set<string>();

/**
 * Summarises one span into a new memory segment. Never throws — compaction is an
 * optimisation and must not be able to break a chat turn.
 */
export async function compactSession(
    sessionId: string,
    preview: SessionExchange[],
    segments: MemorySegment[],
): Promise<boolean> {
    if (inFlight.has(sessionId)) return false;

    // Filter here rather than at the call site: passing an unfiltered list would
    // re-summarise spans already covered and reset the watermark backwards.
    const watermark = segments[segments.length - 1]?.throughUserMessageId ?? 0;
    const tail = preview.filter((ex) => (ex.user?.id ?? 0) > watermark);

    const plan = planCompaction(tail, segments);
    if (!plan) return false;

    inFlight.add(sessionId);
    try {
        const source = renderSpan(plan.span);
        const model = await getDefaultModel();

        const summary = (
            await genLLMText(
                { model, sysPrompt: compactContext, userPrompt: source },
                AbortSignal.timeout(SUMMARISE_TIMEOUT_MS),
            )
        ).trim();

        if (!isUsableSummary(summary, source.length)) {
            console.warn("Compaction rejected: unusable summary", {
                sessionId,
                summaryChars: summary.length,
                sourceChars: source.length,
            });
            return false;
        }

        const written = await appendMemorySegment({
            sessionId,
            seq: plan.seq,
            fromUserMessageId: plan.fromUserMessageId,
            throughUserMessageId: plan.throughUserMessageId,
            content: summary,
            model,
        });

        console.log("Compaction complete", {
            sessionId,
            seq: plan.seq,
            exchanges: plan.span.length,
            sourceTokens: estimateTokens(source),
            summaryTokens: estimateTokens(summary),
            written,
        });

        return written;
    } catch (error) {
        console.error("Compaction failed", {
            sessionId,
            error: error instanceof Error ? error.message : error,
        });
        return false;
    } finally {
        inFlight.delete(sessionId);
    }
}
