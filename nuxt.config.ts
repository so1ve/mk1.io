const description =
	"Ray (@so1ve): maintainer of Vue Language Tools. Writing, projects and recent activity.";

export default defineNuxtConfig({
	modules: ["@nuxtjs/google-fonts"],
	css: ["~/main.css"],
	// The same fonts as the blog theme. Chinese text falls back to system fonts.
	googleFonts: {
		families: {
			"Source Serif 4": { wght: "200..900", ital: "200..900" },
			"IBM Plex Mono": { wght: [400], ital: [400] },
		},
		display: "swap",
		download: true,
		inject: true,
		preload: true,
	},
	app: {
		head: {
			htmlAttrs: {
				lang: "en",
			},
			link: [
				{ rel: "me", href: "https://github.com/so1ve" },
				{
					rel: "alternate",
					type: "application/rss+xml",
					title: "Ray's Blog",
					href: "https://blog.mk1.io/rss.xml",
				},
			],
			meta: [
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ charset: "utf-8" },
				{
					name: "theme-color",
					content: "#f6f4ee",
					media: "(prefers-color-scheme: light)",
				},
				{
					name: "theme-color",
					content: "#141413",
					media: "(prefers-color-scheme: dark)",
				},
				{ name: "description", content: description },
				{ property: "og:title", content: "Ray" },
				{ property: "og:description", content: description },
				{ property: "og:url", content: "https://mk1.io" },
				{ property: "og:type", content: "website" },
				{ name: "twitter:card", content: "summary" },
				{ name: "twitter:creator", content: "@so1v3" },
			],
		},
	},
	features: {
		noScripts: true,
	},
	experimental: {
		payloadExtraction: false,
	},
	nitro: {
		// Pages serves the prerendered output as plain static files, so no
		// request reaches a Function.
		preset: "cloudflare-pages-static",
		prerender: {
			routes: ["/", "/projects", "/activity", "/friends"],
			failOnError: true,
		},
	},
	routeRules: {
		"/.well-known/matrix/**": {
			headers: {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
			},
		},
	},
	compatibilityDate: "2025-10-13",
});
