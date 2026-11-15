<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { SITE } from '../../config/site'
import { useTheme } from '../composables/useTheme'
import { PRIMARIOS } from '../theme/tema'
import IconoTema from './IconoTema.vue'
import ConfiguradorTema from './ConfiguradorTema.vue'
import { useGoatCounter, FLAG_CDN } from '../composables/useGoatCounter'
import { useFocusTrap } from '../composables/useFocusTrap'
import isotipo from '@/assets/img/isotipo.webp'
import { useRouter } from 'vue-router'

const { config, esOscuro, alternarEsquema } = useTheme()
const router = useRouter()

const menuTemaDesktop = ref(false)
const menuTemaMovil = ref(false)
const refMenuTemaDesktop = ref<HTMLElement | null>(null)
const refMenuTemaMovil = ref<HTMLElement | null>(null)
const swatchPrimario = computed(
  () => (PRIMARIOS.find((p) => p.id === config.value.primary) ?? PRIMARIOS[0]).swatch,
)

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

function onKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 't') {
    e.preventDefault()
    alternarEsquema()
    return
  }
  if (e.key !== 'Escape') return
  searchOpen.value = false
  mobileOpen.value = false
  menuTemaDesktop.value = false
  menuTemaMovil.value = false
}

function onClickFueraTema(e: MouseEvent) {
  const target = e.target as Node | null
  if (!target) return
  if (menuTemaDesktop.value && !refMenuTemaDesktop.value?.contains(target)) {
    menuTemaDesktop.value = false
  }
  if (menuTemaMovil.value && !refMenuTemaMovil.value?.contains(target)) {
    menuTemaMovil.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('mousedown', onClickFueraTema)
  load()
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('mousedown', onClickFueraTema)
})
</script>

<template>
  <!-- Header -->
  <div
    id="hdr"
    :class="{ scrolled }"
  >
    <div class="hi">
      <div class="logo-wrap">
        <router-link
          to="/"
          class="logo-link"
        >
          <div class="logo-icon">
            <img
              id="hdr-logo"
              :src="isotipo"
              alt="Isotipo LexGeoCat"
            >
          </div>
          <div class="logo-text">
            <div class="logo-title">
              Lex<span class="geo">Geo</span><span class="cat">Cat</span>
            </div>
            <div class="subtitle">
              Derecho · Catastro · Geomática · Software
            </div>
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
          ><i
            aria-hidden="true"
            class="fa-brands fa-facebook-f"
          /></a>
          <a
            aria-label="YouTube"
            class="hdr-social-btn yt"
            :href="SITE.social.youtube"
            rel="noopener"
            target="_blank"
          ><i
            aria-hidden="true"
            class="fa-brands fa-youtube"
          /></a>
          <a
            aria-label="LinkedIn"
            class="hdr-social-btn lk"
            :href="SITE.social.linkedin"
            rel="noopener"
            target="_blank"
          ><i
            aria-hidden="true"
            class="fa-brands fa-linkedin-in"
          /></a>
          <a
            aria-label="WhatsApp"
            class="hdr-social-btn wa"
            :href="SITE.social.whatsapp"
            rel="noopener"
            target="_blank"
          ><i
            aria-hidden="true"
            class="fa-brands fa-whatsapp"
          /></a>
        </div>
        <!-- Desktop GC Stats -->
        <div
          id="gc-stats-widget"
          class="gc-stats-bar"
        >
          <span class="gc-stat-item gc-views">
            <i
              aria-hidden="true"
              class="fa-solid fa-eye"
            />
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
              >
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
              <i
                aria-hidden="true"
                class="fa-solid fa-chart-simple"
              />
            </a>
          </span>
        </div>
        <button
          aria-label="Buscar en el blog"
          class="icon-btn srch-open-btn"
          type="button"
          @click="searchOpen = true"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-magnifying-glass"
          />
        </button>
        <div
          ref="refMenuTemaDesktop"
          class="nav-tema-grupo"
        >
          <button
            type="button"
            class="nav-btn-tema"
            title="Cambiar entre modo claro y oscuro (Ctrl+Shift+T)"
            :aria-label="esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            @click="alternarEsquema"
          >
            <IconoTema
              tipo="tema"
              :oscuro="esOscuro"
              :tam="15"
            />
            <span>{{ esOscuro ? 'Claro' : 'Oscuro' }}</span>
          </button>
          <button
            type="button"
            :class="['nav-btn-paleta', { activo: menuTemaDesktop }]"
            aria-label="Personalizar tema (Primary, Surface, Preset, Layout)"
            aria-haspopup="dialog"
            :aria-expanded="menuTemaDesktop"
            title="Personalizar tema y paleta de colores"
            @click="menuTemaDesktop = !menuTemaDesktop"
          >
            <IconoTema
              tipo="paleta"
              :tam="15"
              :color="swatchPrimario"
            />
          </button>

          <div
            v-if="menuTemaDesktop"
            class="nav-tema-popover"
          >
            <ConfiguradorTema
              variante="popover"
              @cerrar="menuTemaDesktop = false"
            />
          </div>
        </div>
        <button
          aria-label="Menú"
          class="icon-btn ham"
          type="button"
          :aria-expanded="mobileOpen"
          aria-controls="mob-menu"
          @click="mobileOpen = true"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-bars"
          />
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
      <template
        v-for="item in nav"
        :key="item.id"
      >
        <div
          v-if="item.children"
          class="nav-dropdown"
        >
          <span class="nav-link nav-dropbtn">
            <i
              aria-hidden="true"
              :class="'fa-solid ' + item.icon"
            />{{ item.label }}
            <i
              aria-hidden="true"
              class="fa-solid fa-chevron-down nav-chevron"
            />
          </span>
          <div class="nav-dropdown-content">
            <router-link
              v-for="child in item.children"
              :key="child.id"
              :to="child.path"
              @click="mobileOpen = false"
            >
              <i
                aria-hidden="true"
                :class="'fa-solid ' + child.icon"
              />{{ child.label }}
            </router-link>
          </div>
        </div>
        <a
          v-else-if="item.external"
          :href="item.path"
          class="nav-link"
          target="_blank"
          rel="noopener"
        >
          <i
            aria-hidden="true"
            :class="'fa-solid ' + item.icon"
          />{{ item.label }}
        </a>
        <router-link
          v-else
          :to="item.path"
          class="nav-link"
          active-class="active"
          @click="mobileOpen = false"
        >
          <i
            aria-hidden="true"
            :class="'fa-solid ' + item.icon"
          />{{ item.label }}
        </router-link>
      </template>
    </div>
  </nav>

  <!-- Mobile menu backdrop -->
  <div
    class="mob-backdrop"
    :class="{ open: mobileOpen }"
    aria-hidden="true"
    @click="mobileOpen = false"
  />

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
      <div class="mob-brand">
        <div class="mob-brand-icon">
          <i
            aria-hidden="true"
            class="fa-solid fa-map-location-dot"
          />
        </div>
        <span class="mob-brand-title">{{ SITE.name.slice(0, 3) }}<span class="geo">Geo</span><span class="cat">Cat</span></span>
      </div>
      <div class="mob-actions">
        <div
          ref="refMenuTemaMovil"
          class="nav-tema-grupo"
        >
          <button
            type="button"
            class="nav-btn-tema"
            :aria-label="esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            @click="alternarEsquema"
          >
            <IconoTema
              tipo="tema"
              :oscuro="esOscuro"
              :tam="15"
            />
            <span>{{ esOscuro ? 'Claro' : 'Oscuro' }}</span>
          </button>
          <button
            type="button"
            :class="['nav-btn-paleta', { activo: menuTemaMovil }]"
            aria-label="Personalizar tema"
            aria-haspopup="dialog"
            :aria-expanded="menuTemaMovil"
            @click="menuTemaMovil = !menuTemaMovil"
          >
            <IconoTema
              tipo="paleta"
              :tam="15"
              :color="swatchPrimario"
            />
          </button>

          <div
            v-if="menuTemaMovil"
            class="nav-tema-popover"
          >
            <ConfiguradorTema
              variante="popover"
              @cerrar="menuTemaMovil = false"
            />
          </div>
        </div>
        <button
          class="mob-close"
          type="button"
          aria-label="Cerrar menú"
          @click="mobileOpen = false"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-xmark"
          />
        </button>
      </div>
    </div>
    <div class="mob-search-wrap">
      <i
        aria-hidden="true"
        class="fa-solid fa-magnifying-glass"
      />
      <input
        id="mob-srch-input"
        type="text"
        autocomplete="off"
        placeholder="Buscar en el blog..."
        @keydown.enter="doMobSearch"
      >
      <button
        class="mob-search-btn"
        type="button"
        @click="doMobSearch"
      >
        Buscar
      </button>
    </div>
    <!-- Mobile GC Stats -->
    <div
      id="gc-stats-widget-mob"
      class="gc-stats-bar mob-gc-stats"
    >
      <span class="gc-stat-item gc-views">
        <i
          aria-hidden="true"
          class="fa-solid fa-eye"
        />
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
          >
        </span>
        <a
          class="gc-flag-item gc-more-stats"
          aria-label="Ver más estadísticas"
          :href="SITE.goatcounter + '/'"
          target="_blank"
          rel="noopener"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-chart-simple"
          />
        </a>
      </span>
    </div>
    <ul class="mob-nav">
      <template
        v-for="item in nav"
        :key="item.id"
      >
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
            <span><i
              aria-hidden="true"
              :class="'fa-solid ' + item.icon"
            />{{ item.label }}</span>
            <i
              aria-hidden="true"
              class="fa-solid fa-chevron-down arrow"
            />
          </button>
          <ul
            :id="'mob-submenu-' + item.id"
            class="mob-submenu"
          >
            <li
              v-for="child in item.children"
              :key="child.id"
            >
              <router-link
                :to="child.path"
                @click="mobileOpen = false"
              >
                <i
                  aria-hidden="true"
                  :class="'fa-solid ' + child.icon"
                />{{ child.label }}
              </router-link>
            </li>
          </ul>
        </li>
        <li v-else-if="item.external">
          <a
            :href="item.path"
            target="_blank"
            rel="noopener"
          >
            <i
              aria-hidden="true"
              :class="'fa-solid ' + item.icon"
            />{{ item.label }}
          </a>
        </li>
        <li v-else>
          <router-link
            :to="item.path"
            @click="mobileOpen = false"
          >
            <i
              aria-hidden="true"
              :class="'fa-solid ' + item.icon"
            />{{ item.label }}
          </router-link>
        </li>
      </template>
    </ul>
  </div>

  <!-- Tooltip -->
  <Teleport to="body">
    <div
      v-if="tip"
      class="gc-tooltip"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >
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
    <div
      ref="searchModalRef"
      class="srch-modal"
    >
      <div class="srch-modal-header">
        <i
          aria-hidden="true"
          class="fa-solid fa-magnifying-glass"
        />
        <input
          id="srch-modal-input"
          autocomplete="off"
          placeholder="Buscar en el blog de LexGeoCat..."
          type="text"
          @keydown.enter="doSearch"
          @keydown.escape="searchOpen = false"
        >
        <button
          aria-label="Cerrar búsqueda"
          class="srch-modal-close"
          type="button"
          @click="searchOpen = false"
        >
          <i
            aria-hidden="true"
            class="fa-solid fa-xmark"
          />
        </button>
      </div>
      <div class="srch-modal-body">
        <div class="srch-status">
          <i
            aria-hidden="true"
            class="fa-solid fa-magnifying-glass"
          />
          <span>La búsqueda se realiza en el blog alojado en Blogger. Escribe y presiona Enter.</span>
        </div>
      </div>
    </div>
  </div>
</template>
