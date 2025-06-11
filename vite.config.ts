
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // Remove external configuration for @capacitor/status-bar to allow bundling
      external: []
    }
  },
  // Ensure proper handling of Capacitor modules
  optimizeDeps: {
    include: ['@capacitor/core', '@capacitor/status-bar']
  }
}));
