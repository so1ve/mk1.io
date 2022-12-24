import { URL, fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Unocss from "unocss/vite";
import { presetIcons, presetUno, presetWebFonts, transformerDirectives } from "unocss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Unocss({
      presets: [
        presetUno(),
        presetIcons(),
        presetWebFonts({
          fonts: {
            mono: ["Fira Code", "Fira Mono:400,700", "Inter"],
          },
        }),
      ],
      transformers: [
        transformerDirectives(),
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
