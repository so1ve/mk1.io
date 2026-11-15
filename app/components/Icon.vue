<script setup lang="ts">
import { getIconData, iconToHTML, iconToSVG } from "@iconify/utils";
import { icons } from "@iconify-json/ri";

const props = defineProps<{ name: string }>();

const data = getIconData(icons, props.name);
if (!data) {
	throw new Error(`Unknown Remix icon: ${props.name}`);
}
const { attributes, body } = iconToSVG(data, { height: "1em" });
const svg = iconToHTML(body, { ...attributes, "aria-hidden": "true" });
</script>

<template>
	<span class="icon" v-html="svg" />
</template>
