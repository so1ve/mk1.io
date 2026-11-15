<script setup lang="ts">
import { BLOG_URL } from "../feeds";
import { useSiteData } from "../site-data";

const { friends } = await useSiteData();
const host = (url: string) => new URL(url).host;

useHead({ title: "Friends" });
</script>

<template>
	<main>
		<header class="page-head">
			<h1>Friends</h1>
			<p class="lede">
				Sites by people I know, in name order. Want to be listed?
				<a :href="`${BLOG_URL}/links.html`" target="_blank">Exchange links</a>
				on my blog.
			</p>
		</header>

		<ul class="friend-list">
			<li v-for="friend in friends" :key="friend.url">
				<a :href="friend.url" target="_blank">
					<FriendAvatar :friend="friend" :size="40" />
					<span class="friend-text">
						<span class="friend-name">{{ friend.name }}</span>
						<span v-if="friend.description" class="friend-description">
							{{ friend.description }}
						</span>
						<span class="friend-host">{{ host(friend.url) }}</span>
					</span>
				</a>
			</li>
		</ul>
	</main>
</template>
