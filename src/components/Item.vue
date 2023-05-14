<script setup lang="ts">
const props = defineProps<{
  link: string;
  icon: string;
}>();
</script>

<template>
  <Button :href="props.link">
    <span :class="props.icon" />
    <slot />
  </Button>
</template>
