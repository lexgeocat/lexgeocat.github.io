<script setup lang="ts">
import type { BlogEntry } from '../composables/useBloggerFeed'
import { getCategoryGrad, getCategoryIcon } from '../lib/categories'

defineProps<{ entry: BlogEntry }>()
</script>

<template>
  <a
    class="blog-card"
    :href="entry.url"
    target="_blank"
    rel="noopener"
  >
    <div class="blog-card-thumb">
      <img
        v-if="entry.thumb"
        :src="entry.thumb"
        :alt="entry.title"
        loading="lazy"
      >
      <div
        v-else
        class="blog-card-thumb-plh"
        :style="{ background: getCategoryGrad(entry.categoryLabel) }"
      >
        <i
          aria-hidden="true"
          :class="'fa-solid ' + getCategoryIcon(entry.categoryLabel)"
        />
      </div>
      <span :class="'blog-card-badge ' + entry.categoryCls">{{ entry.categoryLabel }}</span>
    </div>
    <div class="blog-card-body">
      <h3 class="blog-card-title">{{ entry.title }}</h3>
      <p class="blog-card-excerpt">{{ entry.excerpt }}…</p>
      <div class="blog-card-meta">
        <span class="blog-card-date">
          <i
            aria-hidden="true"
            class="fa-regular fa-calendar"
          /> {{ entry.date }}
        </span>
        <span class="blog-card-cta">→ Leer en Blog</span>
      </div>
    </div>
  </a>
</template>
