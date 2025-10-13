export default defineNuxtConfig({
	modules: ["@unocss/nuxt", "@nuxtjs/google-fonts"],
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
				{ name: "apple-mobile-web-app-title", content: "Ray's Homepage" },
				{ name: "msapplication-TileColor", content: "#ffffff" },
				{ name: "msapplication-TileImage", content: "/favicon.png" },
				{ name: "application-name", content: "Ray" },
				{
					id: "description",
					name: "description",
					content: "Ray's Homepage",
				},
				{ id: "og:title", property: "og:title", content: "Ray's Homepage" },
				{ id: "og:description", property: "og:description", content: "Ray" },
				{ id: "og:image", property: "og:image", content: "/favicon.png" },
				{ id: "og:url", property: "og:url", content: "https://mk1.io" },
				{ id: "og:site_name", property: "og:site_name", content: "Ray" },
				{ id: "og:type", property: "og:type", content: "website" },
				{ id: "og:locale", property: "og:locale", content: "en_US" },
				{ id: "twitter:card", name: "twitter:card", content: "summary" },
				{
					id: "twitter:title",
					name: "twitter:title",
					content: "Ray's Homepage",
				},
				{
					id: "twitter:description",
					name: "twitter:description",
					content: "Ray's Homepage",
				},
				{
					id: "twitter:image",
					name: "twitter:image",
					content: "/favicon.png",
				},
				{
					id: "twitter:site",
					name: "twitter:site",
					content: "https://mk1.io",
				},
				{ id: "twitter:creator", name: "twitter:creator", content: "@so1v3" },
			],
		},
	},
	typescript: {
		tsConfig: {
			include: ["uno.config.ts"],
		},
	},
	features: {
		noScripts: true,
	},
	experimental: {
		payloadExtraction: false,
	},
	compatibilityDate: "2025-10-13",
});
