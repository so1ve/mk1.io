export default defineNuxtConfig({
  srcDir: "./src",
  modules: [
    "@unocss/nuxt",
    "@nuxtjs/google-fonts",
    "@kevinmarrec/nuxt-pwa",
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
  pwa: {
    icon: {
      fileName: "favicon.png",
    },
  },
  app: {
    head: {
      title: "Ray",
      link: [
        {
          rel: "icon",
          href: "/favicon.png",
        },
      ],
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { charset: "utf-8" },
        { name: "theme-color", content: "#ffffff" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black" },
        { name: "apple-mobile-web-app-title", content: "Ray" },
        { name: "msapplication-TileColor", content: "#ffffff" },
        { name: "msapplication-TileImage", content: "/favicon.png" },
        { name: "application-name", content: "Ray" },
        { hid: "description", name: "description", content: "Ray's Homepage" },
        { hid: "og:title", property: "og:title", content: "Ray" },
        { hid: "og:description", property: "og:description", content: "Ray" },
        { hid: "og:image", property: "og:image", content: "/favicon.png" },
        { hid: "og:url", property: "og:url", content: "https://mk1.io" },
        { hid: "og:site_name", property: "og:site_name", content: "Ray" },
        { hid: "og:type", property: "og:type", content: "website" },
        { hid: "og:locale", property: "og:locale", content: "en_US" },
        { hid: "twitter:card", name: "twitter:card", content: "summary" },
        { hid: "twitter:title", name: "twitter:title", content: "Ray" },
        { hid: "twitter:description", name: "twitter:description", content: "Ray's Homepage" },
        { hid: "twitter:image", name: "twitter:image", content: "/favicon.png" },
        { hid: "twitter:site", name: "twitter:site", content: "https://mk1.io" },
        { hid: "twitter:creator", name: "twitter:creator", content: "@so1v3" },
      ],
    },
  },
  experimental: {
    noScripts: true,
    payloadExtraction: false,
  },
});
