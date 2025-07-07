import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    return {
      define: {
        'process.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.IMGBB_API_KEY': JSON.stringify(env.VITE_IMGBB_API_KEY),
      }
    };
});