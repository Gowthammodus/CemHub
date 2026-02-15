import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // FIX: `__dirname` is not available in this module context.
          // Replaced `process.cwd()` with `'.'` to avoid a TypeScript type error.
          // `path.resolve('.')` robustly resolves to the project root.
          '@': path.resolve('.'),
        }
      }
    };
});