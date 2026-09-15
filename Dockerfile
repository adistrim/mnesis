FROM oven/bun:1.3.5-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /app/packages/app
RUN bun run build

WORKDIR /app/packages/server
RUN bun build src/index.ts --compile --outfile ./dist/mnesis

# quack-search ships its native binary as a per-platform optional dep; the compiled
# binary cannot resolve it, so stage it at a fixed path for QUACK_BINARY_PATH.
RUN cp "$(find /app/node_modules -path '*/quack-search-linux-*/bin/quack' | head -1)" /app/quack

FROM oven/bun:1.3.5-slim
WORKDIR /app
COPY --from=builder /app/packages/server/dist/mnesis ./
COPY --from=builder /app/packages/app/dist ./public
COPY --from=builder /app/quack /usr/local/bin/quack
ENV QUACK_BINARY_PATH=/usr/local/bin/quack
EXPOSE 3000
CMD ["./mnesis"]
