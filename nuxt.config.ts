export default defineNuxtConfig({
  srcDir: "./src",
  modules: [
    "@unocss/nuxt",
    "@nuxtjs/google-fonts",
  ],
  unocss: {
    preflight: true,
  },
  googleFonts: {
    families: {
      "Fira+Code": true,
      "Inter": true,
      "Fira+Mono": [400, 700],
    },
  },
  experimental: {
    noScripts: true,
    payloadExtraction: false,
  },
});
