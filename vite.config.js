import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiBaseUrl = (env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  if (!apiBaseUrl) {
    throw new Error("Missing VITE_API_BASE_URL for the current Vite mode.");
  }

  return {
    plugins: [react()],
    ...(mode === 'development'
      ? {
          server: {
            proxy: {
              "/api": {
                target: apiBaseUrl,
                changeOrigin: true,
                secure: false,
              },
              "/images": {
                target: apiBaseUrl,
                changeOrigin: true,
                secure: false,
              },
            },
          },
        }
      : {}),
  };
})
