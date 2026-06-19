<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useTheme } from "../composables/useTheme";
import { useGoatCounter, FLAG_CDN } from "../composables/useGoatCounter";
import { useRouter } from "vue-router";
import logonoche from '@/assets/img/logo-noche.png'
import logodia from '@/assets/img/logo-dia.png'

const { isDark, toggle } = useTheme();
const router = useRouter();

const mobileOpen = ref(false);
const scrolled = ref(false);
const navHidden = ref(false);
const searchOpen = ref(false);
const tip = ref<{ text: string; x: number; y: number } | null>(null);
const { totalViews, locations, load } = useGoatCounter();
let lastY = 0;

function showTip(text: string, e: MouseEvent) {
  const el = e.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  let left = Math.max(
    8,
    Math.min(r.left + r.width / 2 - 40, window.innerWidth - 88),
  );
  let top = r.bottom + 7;
  if (top + 28 > window.innerHeight) top = r.top - 28 - 7;
  tip.value = { text, x: left, y: top };
}

function hideTip() {
  tip.value = null;
}

function flagTip(loc: { name: string; count: number }) {
  return `${loc.name}: ${loc.count.toLocaleString("es-BO")} vistas`;
}

const nav = [
  { id: "inicio", label: "Inicio", icon: "fa-house" },
  { id: "servicios", label: "Servicios", icon: "fa-briefcase" },
  {
    id: "temas",
    label: "Especialidades",
    icon: "fa-tags",
    children: [
      { id: "derecho", label: "Derecho", icon: "fa-scale-balanced" },
      { id: "catastro", label: "Catastro", icon: "fa-map" },
      {
        id: "ordenamiento",
        label: "Ordenamiento Territorial",
        icon: "fa-compass-drafting",
      },
      { id: "geografia", label: "Geografía", icon: "fa-earth-americas" },
      {
        id: "topogeodesia",
        label: "Topografía y Geodesia",
        icon: "fa-mountain",
      },
      { id: "geomantica", label: "Geomática", icon: "fa-layer-group" },
      {
        id: "desarrollo",
        label: "Software y Aplicaciones Web",
        icon: "fa-code",
      },
    ],
  },
  { id: "normativa", label: "Biblioteca Jurídica", icon: "fa-scroll" },
  { id: "recursos", label: "Recursos", icon: "fa-folder-open" },
  { id: "blog", label: "Blog", icon: "fa-newspaper", external: true },
  { id: "acerca", label: "Sobre Mí", icon: "fa-user" },
  { id: "contacto", label: "Contacto", icon: "fa-envelope" },
];

const routeMap: Record<string, string> = {
  inicio: "/",
  servicios: "/pages/servicios.html",
  derecho: "/pages/derecho.html",
  catastro: "/pages/catastro.html",
  ordenamiento: "/pages/ordenamiento.html",
  geografia: "/pages/geografia.html",
  topogeodesia: "/pages/topogeodesia.html",
  geomantica: "/pages/geomantica.html",
  desarrollo: "/pages/desarrollo-software.html",
  normativa: "/pages/normativa.html",
  recursos: "/pages/recursos.html",
  blog: "https://lexgeocat.blogspot.com/",
  acerca: "/pages/acerca-de.html",
  contacto: "/pages/contacto.html",
};

function navigateTo(id: string) {
  const href = routeMap[id]
  if (!href) return
  if (href.startsWith('http')) {
    window.location.href = href
  } else {
    router.push(href)
  }
  mobileOpen.value = false
}

function onScroll() {
  const y = window.scrollY;
  scrolled.value = y > 30;
  if (y > lastY && y > 200) {
    navHidden.value = true;
  } else {
    navHidden.value = false;
  }
  lastY = y;
}

function doSearch() {
  const q = (
    document.getElementById("srch-modal-input") as HTMLInputElement
  )?.value?.trim();
  if (!q) return;
  window.location.href = `https://lexgeocat.blogspot.com/search?q=${encodeURIComponent(q)}`;
  searchOpen.value = false;
}

function doMobSearch() {
  const q = (
    document.getElementById("mob-srch-input") as HTMLInputElement
  )?.value?.trim();
  if (!q) return;
  window.location.href = `https://lexgeocat.blogspot.com/search?q=${encodeURIComponent(q)}`;
  mobileOpen.value = false;
}

function toggleMobDropdown(e: Event) {
  const target = e.currentTarget as HTMLElement;
  const drop = target.closest(".mob-dropdown");
  if (!drop) return;
  document.querySelectorAll(".mob-dropdown.active").forEach((d) => {
    if (d !== drop) d.classList.remove("active");
  });
  drop.classList.toggle("active");
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  load();
  const s = document.createElement("script");
  s.dataset.goatcounter = "https://lexgeocat.goatcounter.com/count";
  s.async = true;
  s.src = "//gc.zgo.at/count.js";
  document.head.appendChild(s);
});
onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <!-- Preloader -->
  <div id="ld" :class="{ hide: true }">
    <div class="logo-loader">
      <svg fill="none" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="32"
          cy="32"
          opacity=".2"
          r="28"
          stroke="#D4A843"
          stroke-width="1"
        />
        <circle
          class="ring-anim"
          cx="32"
          cy="32"
          r="28"
          stroke="#D4A843"
          stroke-linecap="round"
          stroke-width="2"
        />
        <text
          fill="#D4A843"
          font-family="serif"
          font-size="16"
          font-weight="700"
          text-anchor="middle"
          x="32"
          y="37"
        >
          L
        </text>
      </svg>
      <span>LexGeoCat</span>
    </div>
  </div>

  <!-- Header -->
  <div id="hdr" :class="{ scrolled }">
    <div class="hi">
      <div class="logo-wrap">
        <a
          href="/"
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
          "
        >
          <div class="logo-icon">
            <img
              :src="isDark ? logonoche : logodia"
              alt="LexGeoCat Logo"
              id="hdr-logo"
            />
          </div>
          <div class="logo-text">
            <h1>Lex<span class="geo">Geo</span><span class="cat">Cat</span></h1>
            <div class="subtitle">
              Derecho · Catastro · Geomática · Software
            </div>
          </div>
        </a>
      </div>
      <div class="hr">
        <div class="hdr-socials">
          <a
            aria-label="Facebook"
            class="hdr-social-btn fb"
            href="https://www.facebook.com/CrisCat17"
            rel="noopener"
            target="_blank"
            ><i class="fa-brands fa-facebook-f"></i
          ></a>
          <a
            aria-label="YouTube"
            class="hdr-social-btn yt"
            href="https://www.youtube.com/@lexgeocat"
            rel="noopener"
            target="_blank"
            ><i class="fa-brands fa-youtube"></i
          ></a>
          <a
            aria-label="LinkedIn"
            class="hdr-social-btn lk"
            href="https://www.linkedin.com/lexgeocat"
            rel="noopener"
            target="_blank"
            ><i class="fa-brands fa-linkedin-in"></i
          ></a>
          <a
            aria-label="WhatsApp"
            class="hdr-social-btn wa"
            href="https://wa.me/59176711790"
            rel="noopener"
            target="_blank"
            ><i class="fa-brands fa-whatsapp"></i
          ></a>
        </div>
        <!-- Desktop GC Stats -->
        <div class="gc-stats-bar" id="gc-stats-widget">
          <span class="gc-stat-item gc-views">
            <i class="fa-solid fa-eye"></i>
            <span class="gc-val">{{
              totalViews ? totalViews.toLocaleString("es-BO") : "—"
            }}</span>
            <span class="gc-lbl">vistas</span>
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
              href="https://lexgeocat.goatcounter.com/"
              target="_blank"
              rel="noopener"
              @mouseenter="showTip('Ver más estadísticas', $event)"
              @mouseleave="hideTip"
            >
              <i class="fa-solid fa-chart-simple"></i>
            </a>
          </span>
        </div>
        <button
          aria-label="Buscar en el blog"
          class="icon-btn srch-open-btn"
          type="button"
          @click="searchOpen = true"
        >
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>
        <button
          aria-label="Cambiar tema"
          class="icon-btn th-btn"
          type="button"
          @click="toggle"
        >
          <i class="fa-solid fa-moon"></i>
          <i class="fa-solid fa-sun"></i>
        </button>
        <button
          aria-label="Menú"
          class="icon-btn ham"
          type="button"
          @click="mobileOpen = true"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- Desktop nav -->
  <nav
    aria-label="Navegación principal"
    class="nav-bar"
    id="nav-bar"
    :class="{ hidden: navHidden }"
    role="navigation"
  >
    <div class="nav-inner">
      <template v-for="item in nav" :key="item.id">
        <div v-if="item.children" class="nav-dropdown">
          <span class="nav-link nav-dropbtn">
            <i :class="'fa-solid ' + item.icon"></i>{{ item.label }}
            <i
              class="fa-solid fa-chevron-down"
              style="margin-left: 4px; font-size: 10px"
            ></i>
          </span>
          <div class="nav-dropdown-content">
            <a
              v-for="child in item.children"
              :key="child.id"
              href="javascript:void(0)"
              @click="navigateTo(child.id)"
            >
              <i
                :class="'fa-solid ' + child.icon"
                style="margin-right: 8px; font-size: 11px"
              ></i
              >{{ child.label }}
            </a>
          </div>
        </div>
        <a
          v-else
          href="javascript:void(0)"
          class="nav-link"
          :class="{ active: $route.path === routeMap[item.id] }"
          @click="navigateTo(item.id)"
        >
          <i :class="'fa-solid ' + item.icon"></i>{{ item.label }}
        </a>
      </template>
    </div>
  </nav>

  <!-- Mobile menu -->
  <div class="mob-menu" id="mob-menu" :class="{ open: mobileOpen }">
    <div class="mob-menu-hd">
      <div style="display: flex; align-items: center; gap: 10px">
        <div class="logo-icon" style="width: 34px; height: 34px">
          <i
            class="fa-solid fa-map-location-dot"
            style="color: var(--gold2); font-size: 14px"
          ></i>
        </div>
        <span
          style="
            font-family: var(--font-display);
            font-size: 1.15rem;
            font-weight: 800;
            color: #fff;
          "
          >Lex<span style="color: var(--teal)">Geo</span
          ><span style="color: var(--gold)">Cat</span></span
        >
      </div>
      <div style="display: flex; align-items: center; gap: 8px">
        <button
          aria-label="Cambiar tema"
          class="icon-btn th-btn-mob"
          type="button"
          @click="toggle"
        >
          <i class="fa-solid fa-moon"></i>
          <i class="fa-solid fa-sun"></i>
        </button>
        <button class="mob-close" type="button" @click="mobileOpen = false">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
    <div class="mob-search-wrap">
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        id="mob-srch-input"
        type="text"
        autocomplete="off"
        placeholder="Buscar en el blog..."
        @keydown.enter="doMobSearch"
      />
      <button class="mob-search-btn" type="button" @click="doMobSearch">
        Buscar
      </button>
    </div>
    <!-- Mobile GC Stats -->
    <div class="gc-stats-bar mob-gc-stats" id="gc-stats-widget-mob">
      <span class="gc-stat-item gc-views">
        <i class="fa-solid fa-eye"></i>
        <span class="gc-val">{{
          totalViews ? totalViews.toLocaleString("es-BO") : "—"
        }}</span>
        <span class="gc-lbl">vistas</span>
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
          href="https://lexgeocat.goatcounter.com/"
          target="_blank"
          rel="noopener"
        >
          <i class="fa-solid fa-chart-simple"></i>
        </a>
      </span>
    </div>
    <ul class="mob-nav">
      <template v-for="item in nav" :key="item.id">
        <li v-if="item.children" class="mob-dropdown">
          <button
            class="mob-dropbtn"
            type="button"
            @click="(e: any) => toggleMobDropdown(e)"
          >
            <span
              ><i :class="'fa-solid ' + item.icon"></i>{{ item.label }}</span
            >
            <i class="fa-solid fa-chevron-down arrow"></i>
          </button>
          <ul class="mob-submenu">
            <li v-for="child in item.children" :key="child.id">
              <a href="javascript:void(0)" @click="navigateTo(child.id)">
                <i :class="'fa-solid ' + child.icon"></i>{{ child.label }}
              </a>
            </li>
          </ul>
        </li>
        <li v-else>
          <a href="javascript:void(0)" @click="navigateTo(item.id)">
            <i :class="'fa-solid ' + item.icon"></i>{{ item.label }}
          </a>
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
    aria-modal="true"
    id="srch-overlay"
    :class="{ open: searchOpen }"
    role="dialog"
    @click.self="searchOpen = false"
  >
    <div class="srch-modal">
      <div class="srch-modal-header">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input
          autocomplete="off"
          id="srch-modal-input"
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
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="srch-modal-body">
        <div class="srch-status">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span
            >La búsqueda se realiza en el blog alojado en Blogger. Escribe y
            presiona Enter.</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
