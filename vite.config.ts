import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      port: 3035,
      host: true, // Allow external access (0.0.0.0)
      strictPort: true,
    },
    define: {
      // Inject API key for browser usage
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '')
    }
  };
});