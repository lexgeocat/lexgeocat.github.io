<script setup lang="ts">
import { SITE } from '../config/site'
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon">
        <i aria-hidden="true" class="fa-solid fa-map-location-dot" />
      </div>
      <span class="sl">Error 404</span>
      <h1 class="st">Página no encontrada</h1>
      <p class="sd">
        La página que buscas no existe o fue movida. Revisá la URL o usá algunos de estos accesos
        directos.
      </p>
    </div>
  </section>
  <section class="page-content">
    <div class="c">
      <div class="at-body" style="text-align: center; max-width: 500px; margin: 0 auto">
        <p style="font-size: 1.05rem; color: var(--text2); margin-bottom: 32px">
          ¿Buscás algo en particular? Probá con estas secciones principales:
        </p>
        <div class="g2" style="gap: 10px; text-align: left; margin-bottom: 36px">
          <router-link class="btn btn-ghost" to="/">
            <i aria-hidden="true" class="fa-solid fa-house" /> Inicio
          </router-link>
          <router-link class="btn btn-ghost" to="/pages/servicios.html">
            <i aria-hidden="true" class="fa-solid fa-briefcase" /> Servicios
          </router-link>
          <router-link class="btn btn-ghost" to="/pages/normativa.html">
            <i aria-hidden="true" class="fa-solid fa-gavel" /> Normativa
          </router-link>
          <router-link class="btn btn-ghost" to="/pages/recursos.html">
            <i aria-hidden="true" class="fa-solid fa-folder-open" /> Recursos
          </router-link>
          <router-link class="btn btn-ghost" to="/pages/acerca-de.html">
            <i aria-hidden="true" class="fa-solid fa-user" /> Sobre Mí
          </router-link>
          <router-link class="btn btn-ghost" to="/pages/contacto.html">
            <i aria-hidden="true" class="fa-solid fa-envelope" /> Contacto
          </router-link>
        </div>
        <p style="font-size: 0.85rem; color: var(--text3)">
          También podés escribirme directamente a
          <strong style="color: var(--text2)">{{ SITE.email }}</strong>
        </p>
      </div>
    </div>
  </section>
</template>
