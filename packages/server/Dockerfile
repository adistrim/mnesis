FROM oven/bun:slim AS base
WORKDIR /usr/src/app

FROM base AS build
COPY package.json ./
RUN bun install --frozen-lockfile

COPY . .
# build single file executable
RUN bun build ./src/index.ts --compile --outfile server

RUN ls -R .
RUN file server || true
RUN ldd server || true

FROM gcr.io/distroless/base-debian12 AS release
WORKDIR /app

COPY --from=build /usr/src/app/server /app/server
ENTRYPOINT ["/app/server"]
