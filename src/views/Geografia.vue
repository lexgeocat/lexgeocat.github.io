<script setup lang="ts">
import TopicPage from '../shared/components/TopicPage.vue'
import { getTopic } from '../content/topics'
const topic = getTopic('geografia')!
</script>
<template><TopicPage :topic="topic" /></template>
