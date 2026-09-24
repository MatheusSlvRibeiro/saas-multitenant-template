/// <reference types="vitest/config" />
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { '@': path.resolve(import.meta.dirname, './src') },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@/styles/variables" as *; @use "@/styles/mixins" as *;`,
            },
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test-setup.ts',
    },
});
