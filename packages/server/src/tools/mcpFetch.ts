const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 1;
const DEFAULT_BACKOFF_MS = 200;

type FetchWithRetryOptions = {
    timeoutMs?: number;
    retries?: number;
    backoffMs?: number;
    retryOnStatuses?: number[];
};

function resolveNumber(value: number | undefined, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? value
        : fallback;
}

async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

export async function fetchWithTimeout(
    input: FetchInput,
    init: FetchInit,
    timeoutMs: number,
): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

export async function fetchWithRetry(
    input: FetchInput,
    init: FetchInit,
    options: FetchWithRetryOptions = {},
): Promise<Response> {
    const timeoutMs = resolveNumber(options.timeoutMs, DEFAULT_TIMEOUT_MS);
    const retries = resolveNumber(options.retries, DEFAULT_RETRIES);
    const backoffMs = resolveNumber(options.backoffMs, DEFAULT_BACKOFF_MS);
    const retryOnStatuses = options.retryOnStatuses ?? [429, 500, 502, 503, 504];

    let attempt = 0;
    while (true) {
        try {
            const response = await fetchWithTimeout(input, init, timeoutMs);
            if (retryOnStatuses.includes(response.status) && attempt < retries) {
                attempt += 1;
                await sleep(backoffMs * attempt);
                continue;
            }
            return response;
        } catch (error) {
            if (attempt < retries) {
                attempt += 1;
                await sleep(backoffMs * attempt);
                continue;
            }
            throw error;
        }
    }
}
