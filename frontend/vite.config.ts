import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  base: "./",

  build: {
    outDir: "dist",
    rollupOptions: {
      external: ["electron"],
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          chunk1: ["react", "react-dom"],
          chunk2: ["antd"],
        },
      },
    },
  },

  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "./src/components"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@stores": path.resolve(__dirname, "./src/stores"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
    },
  },
});
