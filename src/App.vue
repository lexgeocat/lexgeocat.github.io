<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import DefaultLayout from './shared/layouts/DefaultLayout.vue'

const route = useRoute()
const router = useRouter()
const SITE_URL = 'https://lexgeocat.github.io'

const ready = ref(false)
router.isReady().then(() => { ready.value = true })

const isAdmin = computed(() => route.path.startsWith('/admin'))

const title = computed(
  () => (route.meta.title as string) || 'LexGeoCat — Derecho, Catastro y Geomática en Bolivia',
)
const description = computed(
  () =>
    (route.meta.description as string) ||
    'Servicios profesionales en Derecho, Catastro, Ordenamiento Territorial, Geografía, Topografía, Geodesia, Geomática y Desarrollo de Software en Bolivia.',
)
const canonical = computed(() => SITE_URL + route.path)
const robots = computed(() => (route.meta.noindex ? 'noindex,follow' : 'index,follow'))

useHead({
  title,
  meta: [
    { name: 'description', content: description },
    { name: 'robots', content: robots },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'es_BO' },
    { property: 'og:site_name', content: 'LexGeoCat' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ],
  link: [{ rel: 'canonical', href: canonical }],
})
</script>

<template>
  <router-view v-if="ready && isAdmin" />
  <DefaultLayout v-else-if="ready" />
</template>
