import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages：/cpp-003/；本地开发 /
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  base,
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  plugins: [tailwindcss(), viteReact()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
