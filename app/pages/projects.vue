<script setup lang="ts">
import type { Project } from "../feeds";
import { GITHUB_USER } from "../feeds";
import { formatCompact, formatDate } from "../format";
import { useSiteData } from "../site-data";

const { repositories } = await useSiteData();

const pinnedUrls = new Set(repositories.pinned.map((project) => project.url));
const active = repositories.owned.filter(
	(project) => !project.archived && !pinnedUrls.has(project.url),
);
const archived = repositories.owned.filter((project) => project.archived);

// The list is rendered once in update order. Each row also carries its rank by
// stars, and CSS picks which rank to apply, so sorting works without scripts.
const starRank = new Map(
	active
		.toSorted(
			(a, b) => b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt),
		)
		.map((project, index) => [project.url, index]),
);
// GitHub counts a contribution even for a single commit; keep the list to
// projects with some following.
const contributed = repositories.contributed.filter(
	(project: Project) => project.stars >= 50,
);

useHead({ title: "Projects" });
</script>

<template>
	<main>
		<header class="page-head">
			<h1>Projects</h1>
			<p class="lede">
				Things I made, and projects I help maintain. Data comes from
				<a :href="`https://github.com/${GITHUB_USER}`" target="_blank">
					GitHub
				</a>
				and updates with each deploy.
			</p>
		</header>

		<section aria-labelledby="pinned" class="block">
			<header class="block-head"><h2 id="pinned">Pinned</h2></header>
			<ul class="projects">
				<li v-for="project in repositories.pinned" :key="project.url">
					<ProjectCard :project="project" show-owner />
				</li>
			</ul>
		</section>

		<section aria-labelledby="mine" class="block">
			<header class="block-head repo-head">
				<div class="repo-heading">
					<h2 id="mine">My repositories</h2>
					<span class="block-note">{{ active.length }}</span>
				</div>
				<fieldset class="repo-sort">
					<legend>Sort by</legend>
					<label>
						<input id="sort-stars" checked name="repo-sort" type="radio" />
						Stars
					</label>
					<label>
						<input id="sort-updated" name="repo-sort" type="radio" />
						Last updated
					</label>
				</fieldset>
			</header>
			<ol class="repo-table sortable">
				<li
					v-for="(project, index) in active"
					:key="project.url"
					:style="{
						'--by-stars': starRank.get(project.url),
						'--by-updated': index,
					}"
				>
					<a class="repo-name" :href="project.url" target="_blank">
						{{ project.name }}
					</a>
					<span class="repo-description">{{ project.description }}</span>
					<span class="repo-language">
						<template v-if="project.language">
							<span
								class="swatch"
								:style="{
									background: project.language.color ?? 'var(--border)',
								}"
							/>
							{{ project.language.name }}
						</template>
					</span>
					<span class="repo-stars">
						<template v-if="project.stars">
							<Icon name="star-line" />
							{{ formatCompact(project.stars) }}
						</template>
					</span>
					<time class="repo-date" :datetime="project.pushedAt">
						{{ formatDate(project.pushedAt) }}
					</time>
				</li>
			</ol>
		</section>

		<section
			v-if="contributed.length > 0"
			aria-labelledby="contributed"
			class="block"
		>
			<header class="block-head">
				<h2 id="contributed">Contributed to</h2>
				<span class="block-note">Recent commits or pull requests</span>
			</header>
			<ul class="projects">
				<li v-for="project in contributed" :key="project.url">
					<ProjectCard :project="project" show-owner />
				</li>
			</ul>
		</section>

		<section
			v-if="archived.length > 0"
			aria-labelledby="archived"
			class="block"
		>
			<details class="archived">
				<summary>
					<h2 id="archived">Archived</h2>
					<span class="block-note">{{ archived.length }}</span>
				</summary>
				<ol class="repo-table">
					<li v-for="project in archived" :key="project.url">
						<a class="repo-name" :href="project.url" target="_blank">
							{{ project.name }}
						</a>
						<span class="repo-description">{{ project.description }}</span>
						<span class="repo-language">
							<template v-if="project.language">
								<span
									class="swatch"
									:style="{
										background: project.language.color ?? 'var(--border)',
									}"
								/>
								{{ project.language.name }}
							</template>
						</span>
						<span class="repo-stars">
							<template v-if="project.stars">
								<Icon name="star-line" />
								{{ formatCompact(project.stars) }}
							</template>
						</span>
						<time class="repo-date" :datetime="project.pushedAt">
							{{ formatDate(project.pushedAt) }}
						</time>
					</li>
				</ol>
			</details>
		</section>
	</main>
</template>
