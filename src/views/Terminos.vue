<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../composables/useReveal'
const reveal = useReveal()
onMounted(() => { requestAnimationFrame(() => { requestAnimationFrame(() => { reveal.observe() }) }) })
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="page-wrap" style="padding-top:calc(var(--h) + 48px + 48px)">
    <div class="c">
      <article class="at-body">
        <span class="sl">Legal</span>
        <h1 class="at-t">Términos de Uso</h1>
        <p><em>Última actualización: junio 2026</em></p>
        <h2>1. Aceptación</h2>
        <p>Al acceder a LexGeoCat aceptas estos términos. Si no estás de acuerdo, abstente de usar el sitio.</p>
        <h2>2. Naturaleza del contenido</h2>
        <p>Los artículos, guías y recursos tienen fines informativos y educativos. No constituyen asesoría legal individualizada salvo contratación expresa de servicios profesionales.</p>
        <h2>3. Propiedad intelectual</h2>
        <p>Los contenidos originales de LexGeoCat están protegidos por derechos de autor. Puedes citarlos con atribución. La redistribución comercial requiere autorización previa.</p>
        <h2>4. Enlaces externos</h2>
        <p>El sitio enlaza al blog en Blogger y a recursos de terceros. LexGeoCat no se responsabiliza por el contenido de sitios externos.</p>
        <h2>5. Limitación de responsabilidad</h2>
        <p>LexGeoCat no garantiza que la información esté libre de errores o actualizada en todo momento. El usuario asume la responsabilidad del uso que haga de los materiales publicados.</p>
        <h2>6. Contacto</h2>
        <p>Consultas sobre estos términos: lexgeocat@gmail.com</p>
      </article>
    </div>
  </section>
</template>
