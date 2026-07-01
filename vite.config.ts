import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4173
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        modernMinimal: resolve(__dirname, "templates/modern-minimal.html"),
        cyberFuture: resolve(__dirname, "templates/cyber-future.html"),
        trendCulture: resolve(__dirname, "templates/trend-culture.html")
      }
    }
  }
});
