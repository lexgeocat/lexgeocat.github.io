<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../composables/useReveal'
import { useBloggerFeed } from '../composables/useBloggerFeed'
import BlogCard from './BlogCard.vue'
import type { TopicConfig } from '../content/topics'
import { SITE } from '../config/site'

const props = defineProps<{ topic: TopicConfig }>()

const reveal = useReveal()
const { entries, loading, error, load } = useBloggerFeed({
  label: props.topic.blogLabel,
  limit: props.topic.blogLimit ?? 3,
  categoryCls: props.topic.blogBadgeCls,
  categoryLabel: props.topic.blogBadgeLabel,
})

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reveal.observe()
    })
  })
  load()
})
onUnmounted(() => {
  reveal.disconnect()
})
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon">
        <i
          aria-hidden="true"
          :class="'fa-solid ' + topic.icon"
        />
      </div>
      <span class="sl">{{ topic.label }}</span>
      <h1 class="st">
        {{ topic.title }}
      </h1>
      <p class="sd">
        {{ topic.description }}
      </p>
    </div>
  </section>

  <section class="page-content">
    <div class="c">
      <slot name="before-features" />

      <div
        v-if="topic.features.length"
        class="at-body"
      >
        <slot name="intro" />
        <slot name="features-heading">
          <h2>Servicios</h2>
        </slot>
        <div class="feature-grid">
          <div
            v-for="f in topic.features"
            :key="f.title"
            class="feature-item reveal"
          >
            <i
              aria-hidden="true"
              :class="'fa-solid ' + f.icon"
            />
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
        <slot name="after-features" />
      </div>

      <slot />

      <div
        class="sh center"
        style="margin-top: 48px"
      >
        <span class="sl">Blog</span>
        <h2 class="st">
          Artículos recientes
        </h2>
      </div>

      <div
        v-if="loading"
        class="norm-empty"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-spinner fa-spin"
        />
      </div>
      <div
        v-else-if="error"
        class="norm-empty"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-triangle-exclamation"
        /> {{ error }}
      </div>
      <div
        v-else
        class="blog-grid"
      >
        <BlogCard
          v-for="e in entries"
          :key="e.id"
          :entry="e"
        />
      </div>

      <div class="blog-cta">
        <h3>{{ topic.blogCta }}</h3>
        <a
          class="btn btn-gold"
          :href="
            topic.blogCtaHref ||
              `${SITE.blog.url}search/label/${encodeURIComponent(topic.blogLabel)}`
          "
          target="_blank"
          rel="noopener"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-newspaper"
          /> Ver más en el blog
        </a>
      </div>
    </div>
  </section>
</template>
