import { openai } from "./client";

const CACHE_TTL_MS = 5 * 60 * 1000;

/** Chosen as the default when the provider still offers it. */
const PREFERRED_DEFAULT_MODEL = "deepseek-flash";

/** Display names for known ids; anything else falls back to a derived label. */
const KNOWN_LABELS: Record<string, string> = {
    "deepseek-flash": "Flash",
    "deepseek-v4-pro": "Pro",
};

export type ModelOption = {
    id: string;
    label: string;
    isDefault: boolean;
};

let cache: { options: ModelOption[]; fetchedAt: number } | null = null;

function toLabel(id: string): string {
    const known = KNOWN_LABELS[id];
    if (known) {
        return known;
    }
    return id
        .replace(/^deepseek-/, "")
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function buildOptions(ids: string[]): ModelOption[] {
    const defaultId = ids.includes(PREFERRED_DEFAULT_MODEL)
        ? PREFERRED_DEFAULT_MODEL
        : ids[0];
    return ids.map((id) => ({
        id,
        label: toLabel(id),
        isDefault: id === defaultId,
    }));
}

/**
 * Live model list, cached briefly. On failure the last good list is reused so a
 * provider blip cannot empty the selector or block chat.
 */
export async function listModels(): Promise<ModelOption[]> {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        return cache.options;
    }

    try {
        const response = await openai.models.list();
        const ids = response.data.map((m) => m.id).sort();
        if (ids.length > 0) {
            cache = { options: buildOptions(ids), fetchedAt: Date.now() };
        }
    } catch (error) {
        console.error("Failed to list models from provider", error);
    }

    return cache?.options ?? buildOptions([PREFERRED_DEFAULT_MODEL]);
}

export async function getDefaultModel(): Promise<string> {
    const options = await listModels();
    return (options.find((o) => o.isDefault) ?? options[0])!.id;
}

export async function isKnownModel(id: string): Promise<boolean> {
    const options = await listModels();
    return options.some((o) => o.id === id);
}
