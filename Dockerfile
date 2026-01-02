FROM oven/bun:1.3.5-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /app/packages/app
RUN bun run build

WORKDIR /app/packages/server
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun build src/server.ts --compile --target=bun-linux-arm64 --outfile ./dist/mnesis

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=builder /app/packages/server/dist/mnesis ./
COPY --from=builder /app/packages/server/public ./public
EXPOSE 3000
USER nonroot:nonroot
CMD ["./mnesis"]
