<script setup lang="ts">
import type { Activity } from "../feeds";
import { ACTIVITY_ICONS, formatShortDate } from "../format";

defineProps<{ items: Activity[] }>();
</script>

<template>
	<ol class="feed">
		<li
			v-for="item in items"
			:key="item.url + item.date"
			:data-kind="item.kind"
		>
			<Icon class="feed-icon" :name="ACTIVITY_ICONS[item.kind]" />
			<div class="feed-body">
				<a
					v-if="item.title"
					class="feed-title"
					:href="item.url"
					target="_blank"
				>
					{{ item.title }}
				</a>
				<p class="feed-meta">
					<span>{{ item.action }}</span>
					<a :href="`https://github.com/${item.repo}`" target="_blank">
						{{ item.repo }}
					</a>
					<a v-if="item.ref" class="feed-ref" :href="item.url" target="_blank">
						{{ item.ref }}
					</a>
					<a v-if="item.moreCommits > 0" :href="item.url" target="_blank">
						+{{ item.moreCommits }}
						{{ item.moreCommits === 1 ? "commit" : "commits" }}
					</a>
				</p>
			</div>
			<time :datetime="item.date">{{ formatShortDate(item.date) }}</time>
		</li>
	</ol>
</template>
