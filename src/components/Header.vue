<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { SITE } from '../config/site'
import { useTheme } from '../composables/useTheme'
import { useGoatCounter, FLAG_CDN } from '../composables/useGoatCounter'
import { useFocusTrap } from '../composables/useFocusTrap'
import logonoche from '@/assets/img/logo-noche.png'
import logodia from '@/assets/img/logo-dia.png'
import { useRouter } from 'vue-router'

const { isDark, toggle } = useTheme()
const router = useRouter()

const mobileOpen = ref(false)
const scrolled = ref(false)
const navHidden = ref(false)
const searchOpen = ref(false)
const openMobDropdown = ref<string | null>(null)
const tip = ref<{ text: string; x: number; y: number } | null>(null)
const { totalViews, locations, load } = useGoatCounter()
let lastY = 0

const searchModalRef = ref<HTMLElement | null>(null)
const mobMenuRef = ref<HTMLElement | null>(null)
const searchTrap = useFocusTrap(searchModalRef)
const mobTrap = useFocusTrap(mobMenuRef)

watch(searchOpen, (val) => (val ? searchTrap.activate() : searchTrap.deactivate()))
watch(mobileOpen, (val) => (val ? mobTrap.activate() : mobTrap.deactivate()))

function showTip(text: string, e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  let left = Math.max(8, Math.min(r.left + r.width / 2 - 40, window.innerWidth - 88))
  let top = r.bottom + 7
  if (top + 28 > window.innerHeight) top = r.top - 28 - 7
  tip.value = { text, x: left, y: top }
}

function hideTip() {
  tip.value = null
}

function flagTip(loc: { name: string; count: number }) {
  return `${loc.name}: ${loc.count.toLocaleString('es-BO')} visitas`
}
interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  external?: boolean
  children?: NavItem[]
}
interface RouteMetaNav {
  navLabel?: string
  navIcon?: string
  navGroup?: string
}
const NAV_ORDER = [
  'home',
  'servicios',
  'temas',
  'normativa',
  'recursos',
  'blog',
  'acerca-de',
  'contacto',
]

function buildNav(): NavItem[] {
  const routes = router.getRoutes()
  const items: NavItem[] = []
  const grouped: Record<string, NavItem[]> = {}

  for (const r of routes) {
    const m = r.meta as RouteMetaNav
    if (!m?.navLabel) continue
    const item: NavItem = {
      id: r.name as string,
      label: m.navLabel,
      icon: m.navIcon || 'fa-circle',
      path: r.path,
    }
    if (m.navGroup) {
      if (!grouped[m.navGroup]) grouped[m.navGroup] = []
      grouped[m.navGroup].push(item)
    } else {
      items.push(item)
    }
  }

  items.push({
    id: 'blog',
    label: 'Blog',
    icon: 'fa-newspaper',
    path: SITE.blog.url,
    external: true,
  })

  for (const [groupLabel, children] of Object.entries(grouped)) {
    items.push({ id: 'temas', label: groupLabel, icon: 'fa-tags', path: '', children })
  }

  return items.sort((a, b) => {
    const ai = NAV_ORDER.indexOf(a.id)
    const bi = NAV_ORDER.indexOf(b.id)
    if (ai === -1 && bi === -1) return 0
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

const nav = buildNav()

function navigateTo(id: string) {
  const item =
    nav.find((n) => n.id === id) || nav.flatMap((n) => n.children || []).find((n) => n.id === id)
  if (!item) return
  if (item.external || item.path.startsWith('http')) {
    window.open(item.path, '_blank', 'noopener')
  } else {
    router.push(item.path)
  }
  mobileOpen.value = false
}

function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 30
  if (y > lastY && y > 200) {
    navHidden.value = true
  } else {
    navHidden.value = false
  }
  lastY = y
}

function doSearch() {
  const q = (document.getElementById('srch-modal-input') as HTMLInputElement)?.value?.trim()
  if (!q) return
  window.location.href = `${SITE.blog.url}search?q=${encodeURIComponent(q)}`
  searchOpen.value = false
}

function doMobSearch() {
  const q = (document.getElementById('mob-srch-input') as HTMLInputElement)?.value?.trim()
  if (!q) return
  window.location.href = `${SITE.blog.url}search?q=${encodeURIComponent(q)}`
  mobileOpen.value = false
}

function toggleMobDropdown(id: string) {
  openMobDropdown.value = openMobDropdown.value === id ? null : id
}

function onEsc(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  searchOpen.value = false
  mobileOpen.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('keydown', onEsc)
  load()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('keydown', onEsc)
})
</script>

<template>
  <!-- Header -->
  <div id="hdr" :class="{ scrolled }">
    <div class="hi">
      <div class="logo-wrap">
        <router-link
          to="/"
          style="display: flex; align-items: center; gap: 12px; text-decoration: none"
        >
          <div class="logo-icon">
            <img id="hdr-logo" :src="isDark ? logonoche : logodia" alt="LexGeoCat Logo" />
          </div>
          <div class="logo-text">
            <h1>Lex<span class="geo">Geo</span><span class="cat">Cat</span></h1>
            <div class="subtitle">Derecho · Catastro · Geomática · Software</div>
          </div>
        </router-link>
      </div>
      <div class="hr">
        <div class="hdr-socials">
          <a
            aria-label="Facebook"
            class="hdr-social-btn fb"
            :href="SITE.social.facebook"
            rel="noopener"
            target="_blank"
            ><i aria-hidden="true" class="fa-brands fa-facebook-f"
          /></a>
          <a
            aria-label="YouTube"
            class="hdr-social-btn yt"
            :href="SITE.social.youtube"
            rel="noopener"
            target="_blank"
            ><i aria-hidden="true" class="fa-brands fa-youtube"
          /></a>
          <a
            aria-label="LinkedIn"
            class="hdr-social-btn lk"
            :href="SITE.social.linkedin"
            rel="noopener"
            target="_blank"
            ><i aria-hidden="true" class="fa-brands fa-linkedin-in"
          /></a>
          <a
            aria-label="WhatsApp"
            class="hdr-social-btn wa"
            :href="SITE.social.whatsapp"
            rel="noopener"
            target="_blank"
            ><i aria-hidden="true" class="fa-brands fa-whatsapp"
          /></a>
        </div>
        <!-- Desktop GC Stats -->
        <div id="gc-stats-widget" class="gc-stats-bar">
          <span class="gc-stat-item gc-views">
            <i aria-hidden="true" class="fa-solid fa-eye" />
            <span class="gc-val">{{ totalViews ? totalViews.toLocaleString('es-BO') : '—' }}</span>
            <span class="gc-lbl">visitas</span>
          </span>
          <span class="gc-sep">|</span>
          <span class="gc-stat-item gc-locs">
            <span
              v-for="loc in locations"
              :key="loc.code"
              class="gc-flag-item"
              @mouseenter="showTip(flagTip(loc), $event)"
              @mouseleave="hideTip"
              @click.stop="tip ? hideTip() : showTip(flagTip(loc), $event)"
            >
              <img
                class="gc-flag-img"
                :src="`${FLAG_CDN}${loc.code}.png`"
                :alt="loc.name"
                width="16"
                height="12"
                loading="lazy"
              />
            </span>
            <a
              class="gc-flag-item gc-more-stats"
              aria-label="Ver más estadísticas"
              :href="SITE.goatcounter + '/'"
              target="_blank"
              rel="noopener"
              @mouseenter="showTip('Ver más estadísticas', $event)"
              @mouseleave="hideTip"
            >
              <i aria-hidden="true" class="fa-solid fa-chart-simple" />
            </a>
          </span>
        </div>
        <button
          aria-label="Buscar en el blog"
          class="icon-btn srch-open-btn"
          type="button"
          @click="searchOpen = true"
        >
          <i aria-hidden="true" class="fa-solid fa-magnifying-glass" />
        </button>
        <button aria-label="Cambiar tema" class="icon-btn th-btn" type="button" @click="toggle">
          <i aria-hidden="true" class="fa-solid fa-moon" />
          <i aria-hidden="true" class="fa-solid fa-sun" />
        </button>
        <button
          aria-label="Menú"
          class="icon-btn ham"
          type="button"
          :aria-expanded="mobileOpen"
          aria-controls="mob-menu"
          @click="mobileOpen = true"
        >
          <i aria-hidden="true" class="fa-solid fa-bars" />
        </button>
      </div>
    </div>
  </div>

  <!-- Desktop nav -->
  <nav
    id="nav-bar"
    aria-label="Navegación principal"
    class="nav-bar"
    :class="{ hidden: navHidden }"
    role="navigation"
  >
    <div class="nav-inner">
      <template v-for="item in nav" :key="item.id">
        <div v-if="item.children" class="nav-dropdown">
          <span class="nav-link nav-dropbtn">
            <i aria-hidden="true" :class="'fa-solid ' + item.icon" />{{ item.label }}
            <i
              aria-hidden="true"
              class="fa-solid fa-chevron-down"
              style="margin-left: 4px; font-size: 10px"
            />
          </span>
          <div class="nav-dropdown-content">
            <a
              v-for="child in item.children"
              :key="child.id"
              href="javascript:void(0)"
              @click="navigateTo(child.id)"
            >
              <i
                aria-hidden="true"
                :class="'fa-solid ' + child.icon"
                style="margin-right: 8px; font-size: 11px"
              />{{ child.label }}
            </a>
          </div>
        </div>
        <a
          v-else
          href="javascript:void(0)"
          class="nav-link"
          :class="{ active: $route.path === item.path }"
          @click="navigateTo(item.id)"
        >
          <i aria-hidden="true" :class="'fa-solid ' + item.icon" />{{ item.label }}
        </a>
      </template>
    </div>
  </nav>

  <!-- Mobile menu -->
  <div
    id="mob-menu"
    ref="mobMenuRef"
    class="mob-menu"
    :class="{ open: mobileOpen }"
    role="dialog"
    aria-modal="true"
    aria-label="Menú de navegación"
  >
    <div class="mob-menu-hd">
      <div style="display: flex; align-items: center; gap: 10px">
        <div class="logo-icon" style="width: 34px; height: 34px">
          <i
            aria-hidden="true"
            class="fa-solid fa-map-location-dot"
            style="color: var(--copper2); font-size: 14px"
          />
        </div>
        <span
          style="
            font-family: var(--font-display);
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--text);
          "
          >{{ SITE.name.slice(0, 3) }}<span style="color: var(--sapphire)">Geo</span
          ><span style="color: var(--copper)">Cat</span></span
        >
      </div>
      <div style="display: flex; align-items: center; gap: 8px">
        <button aria-label="Cambiar tema" class="icon-btn th-btn-mob" type="button" @click="toggle">
          <i aria-hidden="true" class="fa-solid fa-moon" />
          <i aria-hidden="true" class="fa-solid fa-sun" />
        </button>
        <button
          class="mob-close"
          type="button"
          aria-label="Cerrar menú"
          @click="mobileOpen = false"
        >
          <i aria-hidden="true" class="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
    <div class="mob-search-wrap">
      <i aria-hidden="true" class="fa-solid fa-magnifying-glass" />
      <input
        id="mob-srch-input"
        type="text"
        autocomplete="off"
        placeholder="Buscar en el blog..."
        @keydown.enter="doMobSearch"
      />
      <button class="mob-search-btn" type="button" @click="doMobSearch">Buscar</button>
    </div>
    <!-- Mobile GC Stats -->
    <div id="gc-stats-widget-mob" class="gc-stats-bar mob-gc-stats">
      <span class="gc-stat-item gc-views">
        <i aria-hidden="true" class="fa-solid fa-eye" />
        <span class="gc-val">{{ totalViews ? totalViews.toLocaleString('es-BO') : '—' }}</span>
        <span class="gc-lbl">visitas</span>
      </span>
      <span class="gc-sep">|</span>
      <span class="gc-stat-item gc-locs">
        <span
          v-for="loc in locations"
          :key="loc.code"
          class="gc-flag-item"
          @mouseenter="showTip(flagTip(loc), $event)"
          @mouseleave="hideTip"
        >
          <img
            class="gc-flag-img"
            :src="`${FLAG_CDN}${loc.code}.png`"
            :alt="loc.name"
            width="16"
            height="12"
            loading="lazy"
          />
        </span>
        <a
          class="gc-flag-item gc-more-stats"
          aria-label="Ver más estadísticas"
          :href="SITE.goatcounter + '/'"
          target="_blank"
          rel="noopener"
        >
          <i aria-hidden="true" class="fa-solid fa-chart-simple" />
        </a>
      </span>
    </div>
    <ul class="mob-nav">
      <template v-for="item in nav" :key="item.id">
        <li
          v-if="item.children"
          class="mob-dropdown"
          :class="{ active: openMobDropdown === item.id }"
        >
          <button
            class="mob-dropbtn"
            type="button"
            :aria-expanded="openMobDropdown === item.id"
            :aria-controls="'mob-submenu-' + item.id"
            @click="toggleMobDropdown(item.id)"
          >
            <span><i aria-hidden="true" :class="'fa-solid ' + item.icon" />{{ item.label }}</span>
            <i aria-hidden="true" class="fa-solid fa-chevron-down arrow" />
          </button>
          <ul :id="'mob-submenu-' + item.id" class="mob-submenu">
            <li v-for="child in item.children" :key="child.id">
              <a href="javascript:void(0)" @click="navigateTo(child.id)">
                <i aria-hidden="true" :class="'fa-solid ' + child.icon" />{{ child.label }}
              </a>
            </li>
          </ul>
        </li>
        <li v-else>
          <a href="javascript:void(0)" @click="navigateTo(item.id)">
            <i aria-hidden="true" :class="'fa-solid ' + item.icon" />{{ item.label }}
          </a>
        </li>
      </template>
    </ul>
  </div>

  <!-- Tooltip -->
  <Teleport to="body">
    <div v-if="tip" class="gc-tooltip" :style="{ left: tip.x + 'px', top: tip.y + 'px' }">
      {{ tip.text }}
    </div>
  </Teleport>

  <!-- Search overlay -->
  <div
    id="srch-overlay"
    aria-modal="true"
    :class="{ open: searchOpen }"
    role="dialog"
    @click.self="searchOpen = false"
  >
    <div ref="searchModalRef" class="srch-modal">
      <div class="srch-modal-header">
        <i aria-hidden="true" class="fa-solid fa-magnifying-glass" />
        <input
          id="srch-modal-input"
          autocomplete="off"
          placeholder="Buscar en el blog de LexGeoCat..."
          type="text"
          @keydown.enter="doSearch"
          @keydown.escape="searchOpen = false"
        />
        <button
          aria-label="Cerrar búsqueda"
          class="srch-modal-close"
          type="button"
          @click="searchOpen = false"
        >
          <i aria-hidden="true" class="fa-solid fa-xmark" />
        </button>
      </div>
      <div class="srch-modal-body">
        <div class="srch-status">
          <i aria-hidden="true" class="fa-solid fa-magnifying-glass" />
          <span
            >La búsqueda se realiza en el blog alojado en Blogger. Escribe y presiona Enter.</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
