# mnesis
An exploration of memory, context building, vector stores, and LLM-based web search.

### What are we playing with here?
- Bun – JavaScript runtime
- TypeScript – typed JavaScript
- Hono – lightweight backend framework
- React – frontend framework
- Docker – containerization

All code is organized as a Bun workspace inside the `packages` folder.  
`app` contains the frontend, and `server` contains the backend.

### Getting Started
1. Install dependencies
```bash
bun install
````

2. Set up environment variables
```bash
cp packages/app/.env.example packages/app/.env
cp packages/server/.env.example packages/server/.env
```

Fill in the required values in both the `.env` file.

3. Start development mode
```bash
bun run dev
```

This starts both the frontend and backend in watch mode.

4. Open `http://localhost:5173` in your browser.

More scripts are available in `package.json`, `packages/app/package.json`, and `packages/server/package.json`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
