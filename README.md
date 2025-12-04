# mnesis

__TODO: UPDATE DOCS__

To install dependencies:

```bash
bun install
```

Update `.env` file with your configurations.
```bash
cp .env.example .env
```

Setup database:

```bash
createdb db-name
psql -d db-name -c "CREATE EXTENSION vector;"
bun generate
bun push
```

To run:

```bash
bun run index.ts
```
