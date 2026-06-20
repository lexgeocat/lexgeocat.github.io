<script setup lang="ts">
import type { BlogEntry } from '../composables/useBloggerFeed'

defineProps<{ entry: BlogEntry }>()

const GRAD_MAP: Record<string, string> = {
  Derecho:  'linear-gradient(135deg,var(--color-esp-derecho-bg-from),var(--color-esp-derecho-bg-to))',
  GIS:      'linear-gradient(135deg,var(--color-esp-geomatica-bg-from),var(--color-esp-geomatica-bg-to))',
  Catastro: 'linear-gradient(135deg,var(--color-esp-catastro-bg-from),var(--color-esp-catastro-bg-to))',
}
const ICON_MAP: Record<string, string> = {
  Derecho:  'fa-scale-balanced',
  GIS:      'fa-map-location-dot',
  Catastro: 'fa-draw-polygon',
}
function grad(label: string) {
  return GRAD_MAP[label] || 'linear-gradient(135deg,var(--bg3),var(--bg2))'
}
function icon(label: string) {
  return ICON_MAP[label] || 'fa-newspaper'
}
</script>

<template>
  <a class="blog-card" :href="entry.url" target="_blank" rel="noopener">
    <div class="blog-card-thumb">
      <img v-if="entry.thumb" :src="entry.thumb" :alt="entry.title" loading="lazy" />
      <div
        v-else
        class="blog-card-thumb-plh"
        :style="{ background: grad(entry.categoryLabel) }"
      >
        <i :class="'fa-solid ' + icon(entry.categoryLabel)"></i>
      </div>
      <span :class="'blog-card-badge ' + entry.categoryCls">{{ entry.categoryLabel }}</span>
    </div>
    <div class="blog-card-body">
      <h3 class="blog-card-title">{{ entry.title }}</h3>
      <p class="blog-card-excerpt">{{ entry.excerpt }}…</p>
      <div class="blog-card-meta">
        <span class="blog-card-date">
          <i class="fa-regular fa-calendar"></i> {{ entry.date }}
        </span>
        <span class="blog-card-cta">→ Leer en Blog</span>
      </div>
    </div>
  </a>
</template>