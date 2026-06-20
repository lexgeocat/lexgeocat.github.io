<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../composables/useReveal'
const reveal = useReveal()
onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      reveal.observe()
    })
  })
})
onUnmounted(() => {
  reveal.disconnect()
})
</script>

<template>
  <section class="page-wrap" style="padding-top: calc(var(--h) + 48px + 48px)">
    <div class="c">
      <article class="at-body">
        <span class="sl">Legal</span>
        <h1 class="at-t">Política de Privacidad</h1>
        <p><em>Última actualización: junio 2026</em></p>
        <h2>1. Responsable</h2>
        <p>
          LexGeoCat, operado por Cristian B. Ruiz Q., con sede en Viacha, Departamento de La Paz,
          Bolivia. Contacto: lexgeocat@gmail.com.
        </p>
        <h2>2. Datos que recopilamos</h2>
        <p>
          Este sitio estático puede utilizar almacenamiento local del navegador (preferencia de tema
          claro/oscuro). Si nos contactas por correo o formulario, recibiremos los datos que
          voluntariamente nos proporciones (nombre, email, mensaje).
        </p>
        <h2>3. Blog en Blogger</h2>
        <p>
          El blog está alojado en Blogger (Google). Al visitarlo, aplican las políticas de
          privacidad de Google/Blogger. LexGeoCat no controla directamente el tratamiento de datos
          en esa plataforma.
        </p>
        <h2>4. Finalidad</h2>
        <p>
          Usamos tus datos únicamente para responder consultas profesionales y mejorar los
          contenidos de la plataforma.
        </p>
        <h2>5. Tus derechos</h2>
        <p>
          Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a
          lexgeocat@gmail.com.
        </p>
      </article>
    </div>
  </section>
</template>
