<script setup lang="ts">
</script>

<template>
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon"><i class="fa-solid fa-map-location-dot"></i></div>
      <span class="sl">Error 404</span>
      <h1 class="st">Página no encontrada</h1>
      <p class="sd">La página que buscas no existe o fue movida. Te dejamos algunos accesos directos.</p>
    </div>
  </section>
  <section class="page-content">
    <div class="c" style="display:flex;gap:12px;flex-wrap:wrap">
      <router-link class="btn btn-gold" to="/"><i class="fa-solid fa-house"></i> Ir al inicio</router-link>
      <router-link class="btn btn-ghost" to="/pages/servicios.html"><i class="fa-solid fa-briefcase"></i> Ver servicios</router-link>
      <router-link class="btn btn-ghost" to="/pages/contacto.html"><i class="fa-solid fa-envelope"></i> Contacto</router-link>
    </div>
  </section>
</template>