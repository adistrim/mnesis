FROM oven/bun:slim AS base
WORKDIR /usr/src/app

# Install dependencies in a build environment
FROM base AS build
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy project files and build bundle
COPY . .
RUN bun build index.ts --bundle --target=bun --outdir=dist --minify

# Final lightweight image with NO node_modules
FROM oven/bun:slim AS release
WORKDIR /usr/src/app

# Copy only the bundled output
COPY --from=build /usr/src/app/dist/index.js ./index.js

USER bun
EXPOSE 3000
ENTRYPOINT [ "bun", "run", "index.js" ]
