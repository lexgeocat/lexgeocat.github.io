<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../shared/composables/useReveal'
import { SITE } from '../config/site'
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
  <section class="page-hero">
    <div class="c">
      <div class="page-hero-icon">
        <i
          aria-hidden="true"
          class="fa-solid fa-envelope"
        />
      </div>
      <span class="sl">Contacto</span>
      <h1 class="st">
        Escríbeme
      </h1>
      <p class="sd">
        Consultas profesionales, colaboraciones o asesoramiento en derecho, catastro y geomática.
      </p>
    </div>
  </section>
  <section
    class="sec page-content"
    style="padding-top: 0"
  >
    <div class="c">
      <div class="contact-wrap">
        <div class="contact-info">
          <h3>Información de contacto</h3>
          <p>
            Disponible para consultas en derecho, catastro, GIS y servicios relacionados con la
            gestión territorial en Bolivia.
          </p>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-location-dot"
              />
            </div>
            <div class="contact-text">
              <h4>Ubicación</h4>
              <p>{{ SITE.location }}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-envelope"
              />
            </div>
            <div class="contact-text">
              <h4>Correo</h4>
              <p>{{ SITE.email }}</p>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">
              <i
                aria-hidden="true"
                class="fa-solid fa-id-card"
              />
            </div>
            <div class="contact-text">
              <h4>Registro</h4>
              <p>SIB — R.N.T. Nº {{ SITE.rnt }}</p>
            </div>
          </div>
          <a
            class="btn btn-whatsapp"
            :href="SITE.social.whatsapp"
            target="_blank"
            rel="noopener"
            style="display: inline-flex; width: 100%; justify-content: center; margin-top: 16px"
          ><i
            aria-hidden="true"
            class="fa-brands fa-whatsapp"
          /> WhatsApp</a>
        </div>
        <form
          class="cf-form"
          action="https://formspree.io/f/xovqgdgn"
          method="POST"
        >
          <input
            type="text"
            name="_gotcha"
            style="display: none"
            tabindex="-1"
            autocomplete="off"
          >
          <div class="form-group">
            <label for="nombre">Nombre completo</label><input
              id="nombre"
              type="text"
              name="nombre"
              required
              placeholder="Tu nombre"
            >
          </div>
          <div class="form-group">
            <label for="email">Correo electrónico</label><input
              id="email"
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
            >
          </div>
          <div class="form-group">
            <label for="asunto">Asunto</label>
            <select
              id="asunto"
              name="asunto"
              required
            >
              <option value="">
                Selecciona un tema
              </option>
              <option>Asesoría Legal</option>
              <option>Gestión Catastral</option>
              <option>Consultoría SIG</option>
              <option>Desarrollo SIG</option>
              <option>Otro</option>
            </select>
          </div>
          <div class="form-group">
            <label for="mensaje">Mensaje</label><textarea
              id="mensaje"
              name="mensaje"
              required
              placeholder="Describe tu consulta..."
            />
          </div>
          <button
            type="submit"
            class="btn-submit"
          >
            <i
              aria-hidden="true"
              class="fa-solid fa-paper-plane"
            /> Enviar mensaje
          </button>
          <p style="font-size: 0.75rem; color: var(--text3); margin-top: 12px; text-align: center">
            También puedes escribir directamente a lexgeocat@gmail.com
          </p>
        </form>
      </div>
    </div>
  </section>
</template>
