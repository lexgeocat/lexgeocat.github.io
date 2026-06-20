<script setup lang="ts">
import TopicPage from '../shared/components/TopicPage.vue'
import { getTopic } from '../content/topics'
const topic = getTopic('catastro')!
</script>
<template><TopicPage :topic="topic" /></template>
