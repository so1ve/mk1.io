<script setup lang="ts">
import { BLOG_URL } from "./feeds";
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
	{ label: "Projects", to: "/projects" },
	{ label: "Activity", to: "/activity" },
	{ label: "Friends", to: "/friends" },
];
</script>

<template>
	<header class="site-head">
		<NuxtLink aria-label="Ray, home" class="site-name" to="/">
			<img
				alt=""
				class="site-avatar"
				height="28"
				:src="avatar(56)"
				width="28"
			/>
			<span>Ray</span>
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
		<span>© 2020–{{ builtAt.slice(0, 4) }} Ray</span>
		<span>
			Built
			<time :datetime="builtAt">{{ builtAt.slice(0, 10) }}</time>
		</span>
	</footer>
</template>
