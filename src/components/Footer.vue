<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { SITE } from '../config/site'

const showTop = ref(false)

function onScroll() {
  showTop.value = window.scrollY > 600
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <footer
    id="ft"
    role="contentinfo"
  >
    <div class="ft-main">
      <div class="ft-grid">
        <div class="ft-brand">
          <h3>Lex<span class="geo">Geo</span><span class="cat">Cat</span></h3>
          <div class="ft-tagline">
            {{ SITE.tagline }}
          </div>
          <p>Consultoría profesional en derecho territorial, catastro, geomática y tecnología aplicada al territorio boliviano.</p>
          <div class="ft-contact-list">
            <div class="ft-contact-row">
              <i class="fa-solid fa-envelope" /> {{ SITE.email }}
            </div>
            <div class="ft-contact-row">
              <i class="fa-brands fa-whatsapp" /> {{ SITE.whatsapp }}
            </div>
            <div class="ft-contact-row">
              <i class="fa-solid fa-location-dot" /> {{ SITE.location }}
            </div>
          </div>
          <div class="ft-social">
            <a
              aria-label="Facebook"
              :href="SITE.social.facebook"
              rel="noopener"
              target="_blank"
            ><i class="fab fa-facebook-f" /></a>
            <a
              aria-label="LinkedIn"
              :href="SITE.social.linkedin"
              rel="noopener"
              target="_blank"
            ><i class="fab fa-linkedin-in" /></a>
            <a
              aria-label="YouTube"
              :href="SITE.social.youtube"
              rel="noopener"
              target="_blank"
            ><i class="fab fa-youtube" /></a>
            <a
              aria-label="WhatsApp"
              :href="SITE.social.whatsapp"
              rel="noopener"
              target="_blank"
            ><i class="fab fa-whatsapp" /></a>
          </div>
        </div>
        <div class="ft-col">
          <h4>Especialidades</h4>
          <ul>
            <li>
              <router-link to="/pages/derecho.html">
                <i class="fa-solid fa-chevron-right" />Derecho
              </router-link>
            </li>
            <li>
              <router-link to="/pages/catastro.html">
                <i class="fa-solid fa-chevron-right" />Catastro
              </router-link>
            </li>
            <li>
              <router-link to="/pages/ordenamiento.html">
                <i class="fa-solid fa-chevron-right" />Ord. Territorial
              </router-link>
            </li>
            <li>
              <router-link to="/pages/geografia.html">
                <i class="fa-solid fa-chevron-right" />Geografía
              </router-link>
            </li>
            <li>
              <router-link to="/pages/topogeodesia.html">
                <i class="fa-solid fa-chevron-right" />Topografía y Geodesia
              </router-link>
            </li>
            <li>
              <router-link to="/pages/geomantica.html">
                <i class="fa-solid fa-chevron-right" />Geomática
              </router-link>
            </li>
            <li>
              <router-link to="/pages/desarrollo-software.html">
                <i class="fa-solid fa-chevron-right" />Software
              </router-link>
            </li>
            <li><a :href="SITE.blog.url"><i class="fa-solid fa-chevron-right" />Blog</a></li>
          </ul>
        </div>
        <div class="ft-col">
          <h4>Plataforma</h4>
          <ul>
            <li>
              <router-link to="/pages/acerca-de.html">
                <i class="fa-solid fa-chevron-right" />Sobre Mí
              </router-link>
            </li>
            <li>
              <router-link to="/pages/contacto.html">
                <i class="fa-solid fa-chevron-right" />Contacto
              </router-link>
            </li>
            <li>
              <router-link to="/pages/privacidad.html">
                <i class="fa-solid fa-chevron-right" />Privacidad
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="ft-sep">
      <hr>
    </div>
    <div class="ft-btm">
      <span class="ft-btm-left">© {{ SITE.name }} — Todos los derechos reservados</span>
      <div class="ft-btm-right">
        <router-link to="/pages/privacidad.html">
          Privacidad
        </router-link>
        <router-link to="/pages/terminos.html">
          Términos
        </router-link>
        <router-link to="/pages/contacto.html">
          Contacto
        </router-link>
      </div>
    </div>
    <button
      id="top"
      aria-label="Volver arriba"
      :class="{ show: showTop }"
      type="button"
      @click="scrollTop"
    >
      <i class="fa-solid fa-arrow-up" />
    </button>
  </footer>
</template>