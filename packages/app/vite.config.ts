import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react': ['react', 'react-dom'],
                    'syntax': ['react-syntax-highlighter'],
                    'markdown': [
                        'react-markdown',
                        'remark-gfm',
                        'rehype-raw',
                        'rehype-sanitize',
                    ],
                    'radix': [
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-scroll-area',
                        '@radix-ui/react-select',
                        '@radix-ui/react-slot',
                        '@radix-ui/react-tooltip',
                    ],
                },
            },
        },
    },
})
