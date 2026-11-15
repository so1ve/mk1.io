<script setup lang="ts">
import type { HotSpot } from "../feeds";
import { plural } from "../format";

const props = defineProps<{ spots: HotSpot[] }>();

const busiestWeek = Math.max(1, ...props.spots.flatMap((spot) => spot.weeks));
const mostCommits = Math.max(1, ...props.spots.map((spot) => spot.commits));
// A short square-root scale keeps quiet weeks visible next to busy ones.
const barHeight = (count: number) =>
	count === 0 ? 0 : 12 + 88 * Math.sqrt(count / busiestWeek);
const describe = (spot: HotSpot) =>
	[
		plural(spot.commits, "commit"),
		spot.pullRequests > 0 && plural(spot.pullRequests, "PR"),
	]
		.filter(Boolean)
		.join(" · ");
</script>

<template>
	<ol class="spots">
		<li v-for="spot in spots" :key="spot.repo">
			<a class="spot-name" :href="spot.url" target="_blank">
				<span
					class="swatch"
					:style="{ background: spot.language?.color ?? 'var(--border)' }"
				/>
				<span class="owner">{{ spot.repo.split("/")[0] }}/</span>
				<span>{{ spot.repo.split("/")[1] }}</span>
			</a>
			<span
				class="spot-share"
				:style="{ '--share': spot.commits / mostCommits }"
			/>
			<span class="spot-count">{{ describe(spot) }}</span>
			<span
				aria-hidden="true"
				class="spot-weeks"
				title="Commits per week, oldest first"
			>
				<span
					v-for="(count, week) in spot.weeks"
					:key="week"
					:style="{ height: `${barHeight(count)}%` }"
				/>
			</span>
		</li>
	</ol>
</template>
