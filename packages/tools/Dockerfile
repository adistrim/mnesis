FROM oven/bun:1.3.5-slim AS deps
WORKDIR /app
COPY package.json ./
COPY . .
RUN bun install

FROM deps AS builder
COPY --from=deps /app/node_modules ./node_modules
RUN bun build src/main.ts --compile --target=bun-linux-arm64 --outfile ./dist/tools

FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=builder /app/dist/tools ./
EXPOSE 3001
CMD ["./tools"]
