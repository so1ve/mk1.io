<script setup lang="ts">
import { BLOG_URL, GITHUB_USER } from "./feeds";
import { useSiteData } from "./site-data";

const { profile, builtAt } = await useSiteData();
const avatar = (size: number) => `${profile.avatar}&s=${size}`;
useHead({
	// Pages set only their own name; the home page sets none.
	titleTemplate: (title) => (title ? `${title} | Ray` : "Ray"),
	link: [{ rel: "icon", href: avatar(64) }],
	meta: [{ property: "og:image", content: avatar(400) }],
});

const pages = [
	{ label: "Home", to: "/" },
	{ label: "Projects", to: "/projects" },
	{ label: "Activity", to: "/activity" },
	{ label: "Friends", to: "/friends" },
];

const elsewhere = [
	{ label: "GitHub", url: `https://github.com/${GITHUB_USER}` },
	{ label: "X", url: "https://x.com/so1v3" },
	{ label: "RSS", url: `${BLOG_URL}/rss.xml` },
	{ label: "Sponsor", url: `https://github.com/sponsors/${GITHUB_USER}` },
];
</script>

<template>
	<header class="site-head">
		<NuxtLink class="site-name" to="/">
			<img
				alt=""
				class="site-avatar"
				height="28"
				:src="avatar(56)"
				width="28"
			/>
			Ray
		</NuxtLink>
		<nav aria-label="Pages" class="site-nav">
			<NuxtLink v-for="page in pages" :key="page.to" :to="page.to">
				{{ page.label }}
			</NuxtLink>
			<a :href="BLOG_URL" target="_blank">Blog</a>
		</nav>
	</header>

	<NuxtPage />

	<footer class="site-foot">
		<nav aria-label="Elsewhere">
			<a
				v-for="link in elsewhere"
				:key="link.label"
				:href="link.url"
				target="_blank"
			>
				{{ link.label }}
			</a>
		</nav>
		<span>
			© 2020–{{ builtAt.slice(0, 4) }} Ray · built
			<time :datetime="builtAt">{{ builtAt.slice(0, 10) }}</time>
		</span>
	</footer>
</template>
