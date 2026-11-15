<script setup lang="ts">
import { GITHUB_USER } from "../feeds";
import { HOT_SPOT_WEEKS, useSiteData } from "../site-data";

const { activity, hotSpots, contributions } = await useSiteData();

useHead({ title: "Activity" });
</script>

<template>
	<main>
		<header class="page-head">
			<h1>Activity</h1>
			<p class="lede">
				What I have been working on, from my public
				<a :href="`https://github.com/${GITHUB_USER}`" target="_blank">
					GitHub
				</a>
				activity.
			</p>
		</header>

		<ContributionCalendar :days="contributions" />

		<section aria-labelledby="hot-spots" class="block">
			<header class="block-head">
				<h2 id="hot-spots">Where the work went</h2>
				<span class="block-note">Last {{ HOT_SPOT_WEEKS }} weeks</span>
			</header>
			<HotSpots :spots="hotSpots" />
		</section>

		<section aria-labelledby="recent" class="block">
			<header class="block-head">
				<h2 id="recent">Recent</h2>
				<span class="block-note">
					Latest {{ activity.length }} public events
				</span>
			</header>
			<ActivityFeed :items="activity" />
		</section>
	</main>
</template>
