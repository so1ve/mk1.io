<script setup lang="ts">
import type { Project } from "../feeds";
import { formatCompact } from "../format";

defineProps<{ project: Project; showOwner?: boolean }>();
</script>

<template>
	<a class="project" :href="project.url" target="_blank">
		<span class="project-head">
			<span class="project-name">
				<span v-if="showOwner" class="owner">{{ project.owner }}/</span>
				<span>{{ project.name }}</span>
			</span>
			<span v-if="project.archived" class="project-badge">Archived</span>
		</span>
		<span v-if="project.description" class="project-description">
			{{ project.description }}
		</span>
		<span class="project-meta">
			<span v-if="project.language">
				<span
					class="swatch"
					:style="{ background: project.language.color ?? 'var(--border)' }"
				/>
				{{ project.language.name }}
			</span>
			<span v-if="project.stars">
				<Icon name="star-line" />
				{{ formatCompact(project.stars) }}
			</span>
			<span v-if="project.forks">
				<Icon name="git-fork-line" />
				{{ formatCompact(project.forks) }}
			</span>
		</span>
	</a>
</template>
