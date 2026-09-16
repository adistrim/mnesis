import { z } from "zod";

const isProd = Bun.env.ENV === "prod";

const defaultDevOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:80",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:80",
];

const envSchema = z.object({
    ENV: z.enum(["prod", "dev", "test"]).default("dev"),
    PORT: z.coerce.number().int().positive().default(3000),
    HOST: z.url().default("http://localhost"),
    DB_URL: z.string().min(1),
    LLM_HOST_API: z.string().min(1),
    LLM_HOST: z.string().min(1),
    WEB_SEARCH_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    FETCH_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    WEB_SEARCH_MAX_RESULTS_DEFAULT: z.coerce.number().int().positive().default(10),
    WEB_SEARCH_MAX_RESULTS_MAX: z.coerce.number().int().positive().default(10),
    // Context compaction. Absolute token figures rather than a fraction of the model
    // window: both DeepSeek models expose 1M tokens, but answer quality degrades far
    // earlier than that, and quality is what this exists to protect.
    COMPACT_TRIGGER_TOKENS: z.coerce.number().int().positive().default(24000),
    COMPACT_TARGET_TOKENS: z.coerce.number().int().positive().default(8000),
    COMPACT_MIN_EXCHANGES: z.coerce.number().int().positive().default(4),
    CORS_ALLOWED_ORIGINS: z
        .string()
        .optional()
        .transform((val) => {
        if (!val) {
            return isProd ? [] : defaultDevOrigins;
        }
        return val
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
        }),
});

const parsed = envSchema.safeParse(Bun.env);

if (!parsed.success) {
    console.error("Invalid environment variables:");
    console.error(JSON.stringify(z.treeifyError(parsed.error), null, 2));
    process.exit(1);
}

export const settings = parsed.data;
