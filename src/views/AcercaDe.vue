<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../shared/composables/useReveal'
import logoSib from '../assets/img/logo-sib.jpg'
import logoRpa from '../assets/img/logo-rpa.jpg'
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
  <section
    class="sec-dark"
    style="padding-top: calc(var(--h) + 48px + 48px)"
  >
    <div class="c">
      <div class="about-wrap">
        <div class="about-img-wrap">
          <div class="about-img-ph">
            <div>
              <i
                aria-hidden="true"
                class="fa-solid fa-map-location-dot about-img-ph-icon"
              />
              <div class="about-img-ph-name">
                Cristian B. Ruiz Q.
              </div>
              <div class="about-img-ph-loc">
                La Paz · Bolivia
              </div>
            </div>
          </div>
          <div class="about-badge-wrap">
            <div class="about-badge-n">
              5
            </div>
            <div class="about-badge-l">
              Especialidades
            </div>
          </div>
        </div>
        <div class="about-content">
          <span class="sl">Sobre Mí</span>
          <h1
            class="st"
            style="color: var(--text)"
          >
            Cristian B. Ruiz Q.
          </h1>
          <p class="about-subtitle">
            Técnico Universitario Superior en Catastro y Ordenamiento Territorial · Licenciado en
            Derecho
          </p>
          <p>
            Soy <strong>Tec. Univ. Sup. en Catastro y Ordenamiento Territorial</strong> titulado de
            la <strong>UMSA</strong>, colegiado en la
            <strong>Sociedad de Ingenieros de Bolivia — S.I.B. Nacional</strong> bajo el
            <strong>Registro Nacional Técnico R.N.T. Nº 970285</strong>. Complemento mi formación
            como <strong>Licenciado en Derecho</strong> por la <strong>UPEA</strong>, inscrito en el
            <strong>Registro Público de la Abogacía Nº 13437938CBRQ</strong> del Tribunal Supremo de
            Justicia.
          </p>
          <p>
            Mi ejercicio profesional combina el criterio jurídico con la precisión técnica del
            territorio, permitiéndome abordar proyectos integrales que van desde la gestión
            catastral y la planificación territorial hasta el diseño de soluciones tecnológicas
            aplicadas al Estado y la sociedad.
          </p>
          <h3 class="about-h3">
            Registros profesionales
          </h3>
          <div class="creds-grid">
            <a
              class="cred-card"
              href="https://www.sib.org.bo/guia.html"
              target="_blank"
              rel="noopener"
            >
              <div class="cred-logo">
                <img
                  alt="Sociedad de Ingenieros de Bolivia"
                  :src="logoSib"
                  loading="lazy"
                >
              </div>
              <div class="cred-info">
                <div class="cred-rol">Técnico Catastral</div>
                <div class="cred-org">Sociedad de Ingenieros de Bolivia</div>
                <div class="cred-num">R.N.T. Nº 970285</div>
                <div class="cred-cta">
                  Ver registro
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-arrow-up-right-from-square"
                  />
                </div>
              </div>
            </a>
            <a
              class="cred-card"
              href="https://rpa2.justicia.gob.bo/#/busqueda"
              target="_blank"
              rel="noopener"
            >
              <div class="cred-logo">
                <img
                  alt="Registro Público de la Abogacía"
                  :src="logoRpa"
                  loading="lazy"
                >
              </div>
              <div class="cred-info">
                <div class="cred-rol">Abogado</div>
                <div class="cred-org">Registro Público de la Abogacía · TSJ</div>
                <div class="cred-num">R.P.A. Nº 13437938CBRQ</div>
                <div class="cred-cta">
                  Ver registro
                  <i
                    aria-hidden="true"
                    class="fa-solid fa-arrow-up-right-from-square"
                  />
                </div>
              </div>
            </a>
          </div>
          <h3 class="about-h3">
            Especialidades profesionales
          </h3>
          <div class="about-tags">
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-tractor"
            /> Derecho Agrario</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-building-columns"
            /> Derecho Administrativo</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-leaf"
            /> Derecho Ambiental</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-map"
            /> Catastro</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-compass-drafting"
            /> Ordenamiento
              Territorial</span>
          </div>
          <h3 class="about-h3">
            Conocimientos autodidactas complementarios
          </h3>
          <p class="about-autodidacta-text">
            Además de mi formación universitaria, desarrollo de manera autodidacta competencias
            avanzadas en el campo de la Geomática:
          </p>
          <div class="about-tags">
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-earth-americas"
            /> Sistemas de Información Geográfica (SIG)</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-layer-group"
            /> QGIS</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-globe"
            /> ArcGIS Desktop / ArcGIS Online</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-mountain"
            /> Topografía y Geodesia</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-code"
            /> Desarrollo de Software y Web</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-cube"
            /> PostgreSQL / PostGIS</span>
            <span class="about-tag"><i
              aria-hidden="true"
              class="fa-solid fa-server"
            /> GeoServer / GeoNetwork / GeoNode</span>
          </div>
          <div class="about-actions">
            <router-link
              class="btn btn-gold"
              to="/pages/contacto.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-envelope"
              /> Solicitar consultoría
            </router-link>
            <a
              class="btn btn-ghost"
              href="https://lexgeocat.blogspot.com/"
            ><i
              aria-hidden="true"
              class="fa-solid fa-newspaper"
            /> Visitar el blog</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="sec">
    <div class="c">
      <div class="at-body">
        <h2>Formación y ejercicio profesional</h2>
        <p>
          Mi trayectoria articula dos campos que pocas veces convergen en un mismo perfil: el
          ejercicio del derecho y la gestión técnica del territorio. Esta doble formación me
          permite intervenir en procesos de saneamiento de la propiedad, regularización catastral,
          ordenamiento territorial y asesoría jurídica especializada en Derecho Agrario,
          Administrativo y Ambiental, integrando siempre el marco normativo vigente con la
          realidad técnica del terreno.
        </p>
        <div class="legal-note">
          <i
            aria-hidden="true"
            class="fa-solid fa-circle-info"
          />
          <p>
            Registrado y habilitado para el ejercicio profesional tanto en el ámbito de la
            ingeniería (Catastro y Ordenamiento Territorial) como en el ámbito jurídico (abogacía),
            con cobertura en el departamento de La Paz y a nivel nacional en Bolivia.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>