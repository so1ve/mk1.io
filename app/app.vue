<script setup lang="ts">
import type { ActivityKind, ContributionDay } from "./feeds";
import {
	BLOG_URL,
	GITHUB_USER,
	fetchActivity,
	fetchContributions,
	fetchFriends,
	fetchPosts,
	fetchProfile,
	fetchProjects,
} from "./feeds";

// The page is prerendered without client scripts, so everything below is
// fetched once at build time.
const { data } = await useAsyncData("home", async () => {
	const [posts, projects, activity, contributions, profile, friends] =
		await Promise.all([
			fetchPosts(6),
			fetchProjects(),
			fetchActivity(9),
			fetchContributions(),
			fetchProfile(),
			fetchFriends(),
		]);

	return {
		posts,
		projects,
		activity,
		contributions,
		profile,
		friends,
		builtAt: new Date().toISOString(),
	};
});
const { posts, projects, activity, contributions, profile, friends, builtAt } =
	data.value!;
const [featured, ...olderPosts] = posts;

const avatar = (size: number) => `${profile.avatar}&s=${size}`;
useHead({
	link: [{ rel: "icon", href: avatar(64) }],
	meta: [{ property: "og:image", content: avatar(400) }],
});

const TIME_ZONE = "Asia/Shanghai";
const isoDate = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE });
const shortDate = new Intl.DateTimeFormat("en", {
	timeZone: TIME_ZONE,
	month: "short",
	day: "numeric",
});
const compact = new Intl.NumberFormat("en", {
	notation: "compact",
	maximumFractionDigits: 1,
});
const formatDate = (date: string, format = isoDate) =>
	format.format(new Date(date));

// Calendar columns start on Sunday, matching GitHub's own layout.
const weeks: ContributionDay[][] = [];
for (const day of contributions) {
	if (weeks.length === 0 || new Date(day.date).getUTCDay() === 0) {
		weeks.push([]);
	}
	weeks.at(-1)!.push(day);
}
const leadingBlanks = new Date(contributions[0]!.date).getUTCDay();
const totalContributions = contributions.reduce(
	(sum, day) => sum + day.count,
	0,
);
const activeDays = contributions.filter((day) => day.count > 0).length;
// Calendar dates are plain YYYY-MM-DD values, so format them in UTC.
const dayLabel = new Intl.DateTimeFormat("en", {
	weekday: "short",
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC",
});
const describeCount = (count: number) =>
	count === 0
		? "No contributions"
		: `${count.toLocaleString("en")} contribution${count === 1 ? "" : "s"}`;
const monthLabels = weeks.flatMap((week, index) => {
	const first = week.find((day) => day.date.endsWith("-01"));

	return first
		? [
				{
					column: index + 1,
					label: new Intl.DateTimeFormat("en", {
						month: "short",
						timeZone: "UTC",
					}).format(new Date(first.date)),
				},
			]
		: [];
});

const ACTIVITY_ICONS: Record<ActivityKind, string> = {
	"push": "git-commit-line",
	"pr-open": "git-pull-request-line",
	"pr-merge": "git-merge-line",
	"pr-close": "git-close-pull-request-line",
	"review": "eye-line",
	"issue": "record-circle-line",
	"comment": "chat-1-line",
	"release": "price-tag-3-line",
	"create": "folder-add-line",
	"fork": "git-fork-line",
	"star": "star-line",
};

const LANGUAGE_COLORS: Record<string, string> = {
	TypeScript: "#3178c6",
	JavaScript: "#f1e05a",
	Vue: "#41b883",
	Rust: "#dea584",
	Lua: "#000080",
	Nix: "#7e7eff",
};

const links = [
	{ label: "Blog", url: BLOG_URL, icon: "quill-pen-line" },
	{
		label: "GitHub",
		url: `https://github.com/${GITHUB_USER}`,
		icon: "github-line",
	},
	{ label: "X", url: "https://x.com/so1v3", icon: "twitter-x-line" },
	{ label: "RSS", url: `${BLOG_URL}/rss.xml`, icon: "rss-line" },
	{
		label: "Sponsor",
		url: `https://github.com/sponsors/${GITHUB_USER}`,
		icon: "heart-line",
	},
];
</script>

<template>
	<header class="hero">
		<img alt="" class="avatar" height="88" :src="avatar(176)" width="88" />
		<div class="hero-text">
			<h1>
				Ray
				<span class="handle">@{{ GITHUB_USER }}</span>
			</h1>
			<p class="lede">I maintain open source projects. Studying in Beijing.</p>
			<p class="facts">
				<span>
					<b>{{ compact.format(profile.followers) }}</b>
					followers
				</span>
				<span>
					<b>{{ profile.repos }}</b>
					public repos
				</span>
				<span>
					<b>{{ compact.format(totalContributions) }}</b>
					contributions this year
				</span>
			</p>
		</div>
		<nav aria-label="Elsewhere" class="links">
			<a v-for="link in links" :key="link.label" :href="link.url">
				<Icon :name="link.icon" />
				{{ link.label }}
			</a>
		</nav>
	</header>

	<main>
		<figure aria-labelledby="calendar-caption" class="calendar">
			<div class="calendar-scroll">
				<div class="calendar-grid" :style="{ '--weeks': weeks.length }">
					<span
						v-for="month in monthLabels"
						:key="month.column"
						class="calendar-month"
						:style="{ gridColumn: month.column }"
					>
						{{ month.label }}
					</span>
					<template v-for="(week, column) in weeks" :key="column">
						<span
							v-for="(day, row) in week"
							:key="day.date"
							class="calendar-day"
							:data-level="day.level"
							:style="{
								gridColumn: column + 1,
								gridRow: (column === 0 ? leadingBlanks + row : row) + 2,
							}"
						>
							<span class="calendar-tip">
								<b>{{ describeCount(day.count) }}</b>
								on {{ dayLabel.format(new Date(day.date)) }}
							</span>
						</span>
					</template>
				</div>
			</div>
			<figcaption id="calendar-caption">
				<span class="calendar-summary">
					{{ totalContributions.toLocaleString("en") }} contributions on
					{{ activeDays }} days in the last year
				</span>
				<span aria-hidden="true" class="legend">
					Less
					<span
						v-for="level in 5"
						:key="level"
						class="calendar-day"
						:data-level="level - 1"
					/>
					More
				</span>
			</figcaption>
		</figure>

		<section aria-labelledby="writing" class="block">
			<header class="block-head">
				<h2 id="writing">Writing</h2>
				<a :href="`${BLOG_URL}/posts.html`">
					All posts
					<Icon name="arrow-right-line" />
				</a>
			</header>
			<a v-if="featured" class="featured" :href="featured.url" lang="zh-CN">
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
					<a :href="post.url">{{ post.title }}</a>
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
				<a :href="`https://github.com/${GITHUB_USER}?tab=repositories`">
					All repositories
					<Icon name="arrow-right-line" />
				</a>
			</header>
			<ul class="projects">
				<li v-for="project in projects" :key="project.url">
					<a class="project" :href="project.url">
						<span class="project-head">
							<span class="project-name">
								<span class="owner">{{ project.owner }}/</span>
								<span>{{ project.name }}</span>
							</span>
							<Icon class="out" name="arrow-right-up-line" />
						</span>
						<span class="project-description">{{ project.description }}</span>
						<span class="project-meta">
							<span v-if="project.language">
								<span
									class="swatch"
									:style="{
										background:
											LANGUAGE_COLORS[project.language] ?? 'var(--muted)',
									}"
								/>
								{{ project.language }}
							</span>
							<span>
								<Icon name="star-line" />
								{{ compact.format(project.stars) }}
							</span>
							<span v-if="project.forks">
								<Icon name="git-fork-line" />
								{{ compact.format(project.forks) }}
							</span>
						</span>
					</a>
				</li>
			</ul>
		</section>

		<section aria-labelledby="activity" class="block">
			<header class="block-head">
				<h2 id="activity">Recently on GitHub</h2>
				<a :href="`https://github.com/${GITHUB_USER}`">
					Profile
					<Icon name="arrow-right-line" />
				</a>
			</header>
			<ol class="timeline">
				<li
					v-for="item in activity"
					:key="item.url + item.date"
					:data-kind="item.kind"
				>
					<Icon class="timeline-icon" :name="ACTIVITY_ICONS[item.kind]" />
					<div class="timeline-body">
						<p class="timeline-head">
							<span class="timeline-text">
								{{ item.action }}
								<a :href="`https://github.com/${item.repo}`">{{ item.repo }}</a>
								<a v-if="item.ref" class="timeline-ref" :href="item.url">
									{{ item.ref }}
								</a>
							</span>
							<time :datetime="item.date">
								{{ formatDate(item.date, shortDate) }}
							</time>
						</p>
						<ul v-if="item.details.length > 0" class="timeline-details">
							<li
								v-for="detail in item.details"
								:key="detail.url + detail.text"
							>
								<a :href="detail.url">
									<code v-if="detail.sha">{{ detail.sha }}</code>
									<span>{{ detail.text }}</span>
								</a>
							</li>
							<li v-if="item.moreCommits > 0">
								<a class="timeline-more" :href="item.url">
									{{ item.moreCommits }} more
									{{ item.moreCommits === 1 ? "commit" : "commits" }}
								</a>
							</li>
						</ul>
					</div>
				</li>
			</ol>
		</section>

		<section v-if="friends.length > 0" aria-labelledby="friends" class="block">
			<header class="block-head">
				<h2 id="friends">Friends</h2>
				<a :href="`${BLOG_URL}/links.html`">
					Exchange links
					<Icon name="arrow-right-line" />
				</a>
			</header>
			<ul class="friends">
				<li v-for="friend in friends" :key="friend.url">
					<a :href="friend.url">
						<img
							v-if="friend.avatar"
							alt=""
							decoding="async"
							height="28"
							loading="lazy"
							:src="friend.avatar"
							width="28"
						/>
						<span v-else aria-hidden="true" class="friend-initial">
							{{ [...friend.name][0] }}
						</span>
						<span>{{ friend.name }}</span>
					</a>
				</li>
			</ul>
		</section>
	</main>

	<footer>
		<span>© 2020–{{ builtAt.slice(0, 4) }} Ray</span>
		<span>
			Built
			<time :datetime="builtAt">{{ formatDate(builtAt) }}</time>
			from
			<a href="https://github.com/so1ve/mk1.io">so1ve/mk1.io</a>
		</span>
	</footer>
</template>
