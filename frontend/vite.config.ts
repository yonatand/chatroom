import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

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
