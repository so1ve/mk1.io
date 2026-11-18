<script setup lang="ts">
import { BLOG_URL, GITHUB_USER } from "../feeds";
import { formatDate } from "../format";
import { HOT_SPOT_WEEKS, useSiteData } from "../site-data";

const {
	posts,
	repositories,
	activity,
	hotSpots,
	contributions,
	profile,
	friends,
} = await useSiteData();
const [featured, ...olderPosts] = posts;

const elsewhere = [
	{
		label: "GitHub",
		icon: "github-line",
		url: `https://github.com/${GITHUB_USER}`,
	},
	{ label: "X", url: "https://x.com/so1v3" },
	{ label: "RSS", icon: "rss-line", url: `${BLOG_URL}/rss.xml` },
	{
		label: "Sponsor",
		icon: "heart-3-line",
		url: `https://github.com/sponsors/${GITHUB_USER}`,
	},
];
</script>

<template>
	<main>
		<header class="hero">
			<img
				alt=""
				class="hero-avatar"
				height="120"
				:src="`${profile.avatar}&s=240`"
				width="120"
			/>
			<div class="hero-copy">
				<h1>Ray</h1>
				<p class="hero-bio">
					I maintain open source projects. Studying in Beijing.
				</p>
			</div>
			<ul aria-label="Elsewhere" class="elsewhere">
				<li v-for="link in elsewhere" :key="link.label">
					<a :href="link.url" target="_blank">
						<Icon v-if="link.icon" :name="link.icon" />
						{{ link.label }}
					</a>
				</li>
			</ul>
		</header>

		<ContributionCalendar :days="contributions" />

		<section aria-labelledby="writing" class="block">
			<header class="block-head">
				<h2 id="writing">Writing</h2>
				<a :href="`${BLOG_URL}/posts.html`" target="_blank">
					All posts
					<Icon name="arrow-right-up-line" />
				</a>
			</header>
			<a
				v-if="featured"
				class="featured"
				:href="featured.url"
				lang="zh-CN"
				target="_blank"
			>
				<span class="meta">
					<time :datetime="featured.date">{{ formatDate(featured.date) }}</time>
					<span>{{ featured.category }}</span>
				</span>
				<span class="featured-title">{{ featured.title }}</span>
				<span v-if="featured.excerpt" class="featured-excerpt">
					{{ featured.excerpt }}
				</span>
			</a>
			<ol class="posts" lang="zh-CN">
				<li v-for="post in olderPosts" :key="post.url">
					<a :href="post.url" target="_blank">{{ post.title }}</a>
					<span aria-hidden="true" class="dots" />
					<span class="meta">
						<span>{{ post.category }}</span>
						<time :datetime="post.date">{{ formatDate(post.date) }}</time>
					</span>
				</li>
			</ol>
		</section>

		<section aria-labelledby="projects" class="block">
			<header class="block-head">
				<h2 id="projects">Projects</h2>
				<NuxtLink to="/projects">
					All projects
					<Icon name="arrow-right-line" />
				</NuxtLink>
			</header>
			<ul class="projects">
				<li v-for="project in repositories.pinned" :key="project.url">
					<ProjectCard :project="project" show-owner />
				</li>
			</ul>
		</section>

		<section aria-labelledby="hot-spots" class="block">
			<header class="block-head">
				<h2 id="hot-spots">Where the work went</h2>
				<NuxtLink to="/activity">
					Last {{ HOT_SPOT_WEEKS }} weeks
					<Icon name="arrow-right-line" />
				</NuxtLink>
			</header>
			<HotSpots :spots="hotSpots.slice(0, 6)" />
		</section>

		<section aria-labelledby="activity" class="block">
			<header class="block-head">
				<h2 id="activity">Recently on GitHub</h2>
				<NuxtLink to="/activity">
					All activity
					<Icon name="arrow-right-line" />
				</NuxtLink>
			</header>
			<ActivityFeed :items="activity.slice(0, 6)" />
		</section>

		<section aria-labelledby="friends" class="block">
			<header class="block-head">
				<h2 id="friends">Friends</h2>
				<NuxtLink to="/friends">
					All {{ friends.length }}
					<Icon name="arrow-right-line" />
				</NuxtLink>
			</header>
			<ul class="friend-chips">
				<li v-for="friend in friends.slice(0, 12)" :key="friend.url">
					<a :href="friend.url" target="_blank">
						<FriendAvatar :friend="friend" />
						<span>{{ friend.name }}</span>
					</a>
				</li>
			</ul>
		</section>
	</main>
</template>
