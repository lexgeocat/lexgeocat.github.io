<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../composables/useReveal'
import logoSib from '../assets/img/logo-sib.jpg'
import logoRpa from '../assets/img/logo-rpa.jpg'
const reveal = useReveal()
onMounted(() => { requestAnimationFrame(() => { requestAnimationFrame(() => { reveal.observe() }) }) })
onUnmounted(() => { reveal.disconnect() })
</script>

<template>
  <section class="sec-dark" style="padding-top: calc(var(--h) + 48px + 48px)">
    <div class="c">
      <div class="about-wrap">
        <div class="about-img-wrap">
          <div class="about-img-ph">
            <div>
              <i class="fa-solid fa-map-location-dot about-img-ph-icon"></i>
              <div class="about-img-ph-name">Cristian B. Ruiz Q.</div>
              <div class="about-img-ph-loc">Viacha · La Paz · Bolivia</div>
            </div>
          </div>
          <div class="about-badge-wrap">
            <div class="about-badge-n">7</div>
            <div class="about-badge-l">Especialidades</div>
          </div>
        </div>
        <div class="about-content">
          <span class="sl">Sobre Mí</span>
          <h1 class="st" style="color:var(--text)">Cristian B. Ruiz Quiroga</h1>
          <p class="about-subtitle">
            Técnico Universitario Superior en Catastro y Ordenamiento Territorial · Licenciado en Derecho
          </p>
          <p>Soy <strong>Tec. Univ. Sup. en Catastro y Ordenamiento Territorial</strong> egresado de la <strong>UMSA</strong>, colegiado en la <strong>Sociedad de Ingenieros de Bolivia — S.I.B. Nacional</strong> bajo el <strong>Registro Nacional Técnico R.N.T. Nº 970285</strong>. Complemento mi formación como <strong>Licenciado en Derecho</strong> por la <strong>UPEA</strong>, inscrito en el <strong>Registro Público de la Abogacía Nº 13437938CBRQ</strong> del Tribunal Supremo de Justicia.</p>
          <p>Mi ejercicio profesional combina el criterio jurídico con la precisión técnica del territorio, permitiéndome abordar proyectos integrales que van desde la gestión catastral y la planificación territorial hasta el diseño de soluciones tecnológicas aplicadas al Estado y la sociedad.</p>
          <h3 class="about-h3">Registros profesionales</h3>
          <div class="creds-grid">
            <a class="cred-card" href="https://www.sib.org.bo/guia.html" target="_blank" rel="noopener">
              <div class="cred-logo"><img alt="Sociedad de Ingenieros de Bolivia" :src="logoSib" loading="lazy"></div>
              <div class="cred-info">
                <div class="cred-rol">Técnico Catastral</div>
                <div class="cred-org">Sociedad de Ingenieros de Bolivia</div>
                <div class="cred-num">R.N.T. Nº 970285</div>
                <div class="cred-cta">Ver registro <i class="fa-solid fa-arrow-up-right-from-square"></i></div>
              </div>
            </a>
            <a class="cred-card" href="https://rpa2.justicia.gob.bo/#/busqueda" target="_blank" rel="noopener">
              <div class="cred-logo"><img alt="Registro Público de la Abogacía" :src="logoRpa" loading="lazy"></div>
              <div class="cred-info">
                <div class="cred-rol">Abogado</div>
                <div class="cred-org">Registro Público de la Abogacía · TSJ</div>
                <div class="cred-num">R.P.A. Nº 13437938CBRQ</div>
                <div class="cred-cta">Ver registro <i class="fa-solid fa-arrow-up-right-from-square"></i></div>
              </div>
            </a>
          </div>
          <h3 class="about-h3">Especialidades profesionales</h3>
          <div class="about-tags">
            <span class="about-tag"><i class="fa-solid fa-scale-balanced"></i> Derecho</span>
            <span class="about-tag"><i class="fa-solid fa-map"></i> Catastro</span>
            <span class="about-tag"><i class="fa-solid fa-compass-drafting"></i> Ordenamiento Territorial</span>
            <span class="about-tag"><i class="fa-solid fa-earth-americas"></i> Geografía</span>
            <span class="about-tag"><i class="fa-solid fa-mountain"></i> Topografía y Geodesia</span>
            <span class="about-tag"><i class="fa-solid fa-layer-group"></i> Geomática</span>
            <span class="about-tag"><i class="fa-solid fa-code"></i> Desarrollo de Software y Web</span>
          </div>
          <h3 class="about-h3">Conocimientos autodidactas complementarios</h3>
          <p class="about-autodidacta-text">Además de mi formación universitaria, desarrollo de manera autodidacta competencias avanzadas en:</p>
          <div class="about-tags">
            <span class="about-tag"><i class="fa-solid fa-cube"></i> PostgreSQL / PostGIS</span>
            <span class="about-tag"><i class="fa-solid fa-server"></i> GeoServer / MapServer</span>
            <span class="about-tag"><i class="fa-solid fa-map"></i> QGIS avanzado</span>
            <span class="about-tag"><i class="fa-solid fa-satellite-dish"></i> Teledetección</span>
            <span class="about-tag"><i class="fa-solid fa-drone"></i> Fotogrametría con drone</span>
            <span class="about-tag"><i class="fa-solid fa-globe"></i> Python geo-espacial</span>
            <span class="about-tag"><i class="fa-solid fa-code"></i> JavaScript / Leaflet / MapLibre</span>
            <span class="about-tag"><i class="fa-solid fa-gears"></i> Automatización SIG</span>
            <span class="about-tag"><i class="fa-solid fa-cloud"></i> Despliegue web (VPS, GitHub Pages)</span>
          </div>
          <div class="about-actions">
            <router-link class="btn btn-gold" to="/pages/contacto.html"><i class="fa-solid fa-envelope"></i> Solicitar consultoría</router-link>
            <a class="btn btn-ghost" href="https://lexgeocat.blogspot.com/"><i class="fa-solid fa-newspaper"></i> Visitar el blog</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="sec">
    <div class="c">
      <div class="at-body">
        <h2>Formación y ejercicio profesional</h2>
        <p>Mi perfil combina la práctica jurídica con la gestión técnica del territorio, lo que me permite abordar proyectos que requieren tanto criterio legal como precisión cartográfica, catastral y tecnológica.</p>
        <div class="legal-note"><i class="fa-solid fa-circle-info"></i><p>Registrado y habilitado para el ejercicio profesional tanto en el ámbito de la ingeniería (Catastro y Ordenamiento Territorial) como en el ámbito jurídico (abogacía), con cobertura en el departamento de La Paz y a nivel nacional en Bolivia.</p></div>
      </div>
    </div>
  </section>
</template>