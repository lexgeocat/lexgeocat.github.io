<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
  <footer id="ft" role="contentinfo">
    <div class="ft-main">
      <div class="ft-grid">
        <div class="ft-brand">
          <h3>Lex<span class="geo">Geo</span><span class="cat">Cat</span></h3>
          <div class="ft-tagline">Derecho · Catastro · Geomática · Software</div>
          <p>Consultoría profesional en derecho territorial, catastro, geomática y tecnología aplicada al territorio boliviano.</p>
          <div class="ft-contact" style="margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:.82rem;color:var(--text2)">
              <i class="fa-solid fa-envelope" style="color:var(--gold);font-size:11px;width:16px;text-align:center"></i> lexgeocat@gmail.com
            </div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:.82rem;color:var(--text2)">
              <i class="fa-brands fa-whatsapp" style="color:var(--gold);font-size:11px;width:16px;text-align:center"></i> +591 76711790
            </div>
            <div style="display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--text2)">
              <i class="fa-solid fa-location-dot" style="color:var(--gold);font-size:11px;width:16px;text-align:center"></i> Viacha, La Paz — Bolivia
            </div>
          </div>
          <div class="ft-social">
            <a aria-label="Facebook" href="https://www.facebook.com/CrisCat17" rel="noopener" target="_blank"><i class="fab fa-facebook-f"></i></a>
            <a aria-label="LinkedIn" href="https://www.linkedin.com/lexgeocat" rel="noopener" target="_blank"><i class="fab fa-linkedin-in"></i></a>
            <a aria-label="YouTube" href="https://www.youtube.com/@lexgeocat" rel="noopener" target="_blank"><i class="fab fa-youtube"></i></a>
            <a aria-label="WhatsApp" href="https://wa.me/59176711790" rel="noopener" target="_blank"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
        <div class="ft-col">
          <h4>Especialidades</h4>
          <ul>
            <li><router-link to="/pages/derecho.html"><i class="fa-solid fa-chevron-right"></i>Derecho</router-link></li>
            <li><router-link to="/pages/catastro.html"><i class="fa-solid fa-chevron-right"></i>Catastro</router-link></li>
            <li><router-link to="/pages/ordenamiento.html"><i class="fa-solid fa-chevron-right"></i>Ord. Territorial</router-link></li>
            <li><router-link to="/pages/geografia.html"><i class="fa-solid fa-chevron-right"></i>Geografía</router-link></li>
            <li><a href="https://lexgeocat.blogspot.com/"><i class="fa-solid fa-chevron-right"></i>Blog</a></li>
          </ul>
        </div>
        <div class="ft-col">
          <h4>Plataforma</h4>
          <ul>
            <li><router-link to="/pages/acerca-de.html"><i class="fa-solid fa-chevron-right"></i>Sobre Mí</router-link></li>
<li><router-link to="/pages/contacto.html"><i class="fa-solid fa-chevron-right"></i>Contacto</router-link></li>            <li><router-link to="/pages/privacidad.html"><i class="fa-solid fa-chevron-right"></i>Privacidad</router-link></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="ft-sep"><hr></div>
    <div class="ft-btm">
      <span class="ft-btm-left">© LexGeoCat — Todos los derechos reservados</span>
      <div class="ft-btm-right">
        <router-link to="/pages/privacidad.html">Privacidad</router-link>
        <router-link to="/pages/terminos.html">Términos</router-link>
        <router-link to="/pages/contacto.html">Contacto</router-link>
      </div>
    </div>
    <button aria-label="Volver arriba" id="top" :class="{ show: showTop }" type="button" @click="scrollTop"><i class="fa-solid fa-arrow-up"></i></button>
  </footer>
</template>
