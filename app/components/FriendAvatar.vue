<script setup lang="ts">
import type { Friend } from "../feeds";

defineProps<{ friend: Friend; size?: number }>();
</script>

<template>
	<img
		v-if="friend.avatar"
		alt=""
		class="friend-avatar"
		decoding="async"
		:height="size ?? 28"
		loading="lazy"
		:src="friend.avatar"
		:width="size ?? 28"
	/>
	<span
		v-else
		aria-hidden="true"
		class="friend-avatar friend-initial"
		:style="{ width: `${size ?? 28}px`, height: `${size ?? 28}px` }"
	>
		{{ [...friend.name][0] }}
	</span>
</template>
