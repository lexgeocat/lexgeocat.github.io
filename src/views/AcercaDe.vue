<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useReveal } from '../shared/composables/useReveal'
import { SITE } from '../config/site'
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
                class="fa-solid fa-users about-img-ph-icon"
              />
              <div class="about-img-ph-name">
                {{ SITE.name }}
              </div>
              <div class="about-img-ph-loc">
                {{ SITE.location }}
              </div>
            </div>
          </div>
          <div class="about-badge-wrap">
            <div class="about-badge-n">
              7
            </div>
            <div class="about-badge-l">
              Áreas Técnicas
            </div>
          </div>
        </div>

        <div class="about-content">
          <span class="sl">Sobre Nosotros</span>
          <h1
            class="st"
            style="color: var(--text)"
          >
            {{ SITE.name }} — Consultoría Técnico-Jurídica
          </h1>
          <p class="about-subtitle">
            Equipo interdisciplinario y red colaborativa de profesionales del territorio en
            {{ SITE.location }}
          </p>
          <p>
            Somos una firma y plataforma técnica especializada en integrar el derecho territorial
            con el catastro, el ordenamiento territorial, la topografía, la geomática y el
            desarrollo de software geoespacial para el contexto normativo de Bolivia.
          </p>
          <p>
            Bajo la dirección de <strong>{{ SITE.founder }}</strong> (T.U.S. en Catastro y
            Ordenamiento Territorial — UMSA; Licenciado en Derecho — UPEA), articulamos una red de
            especialistas y colegas colaboradores en ingeniería, geodesia y tecnología para abordar
            proyectos integrales con respaldo jurídico y precisión técnica.
          </p>

          <h3 class="about-h3">
            Registros de dirección técnico-jurídica
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
                <div class="cred-num">R.N.T. Nº {{ SITE.rnt }}</div>
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
                <div class="cred-num">R.P.A. Nº {{ SITE.rpa }}</div>
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
            Equipo y red multidisciplinaria
          </h3>
          <div class="about-team-grid">
            <article class="about-team-card">
              <div class="about-team-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-scale-balanced"
                />
              </div>
              <div>
                <h4>Dirección Técnico-Jurídica</h4>
                <p>
                  {{ SITE.founder }} · Conducción legal, saneamiento predial y gestión catastral.
                </p>
              </div>
            </article>
            <article class="about-team-card">
              <div class="about-team-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-mountain"
                />
              </div>
              <div>
                <h4>Topografía y Geodesia</h4>
                <p>
                  Profesionales asociados en levantamientos GNSS, estación total y red SIRGAS-BOL.
                </p>
              </div>
            </article>
            <article class="about-team-card">
              <div class="about-team-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-layer-group"
                />
              </div>
              <div>
                <h4>Geomática y Web GIS</h4>
                <p>
                  Especialistas colaboradores en PostGIS, QGIS, teledetección y geoportales web.
                </p>
              </div>
            </article>
            <article class="about-team-card">
              <div class="about-team-icon">
                <i
                  aria-hidden="true"
                  class="fa-solid fa-handshake"
                />
              </div>
              <div>
                <h4>Alianzas con Colegas</h4>
                <p>
                  Colaboración abierta con abogados, arquitectos, ingenieros y equipos municipales.
                </p>
              </div>
            </article>
          </div>

          <div class="about-actions">
            <router-link
              class="btn btn-gold"
              to="/pages/contacto.html"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-envelope"
              /> Solicitar consultoría o alianza
            </router-link>
            <a
              class="btn btn-ghost"
              :href="SITE.blog.url"
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
      <div class="sh center">
        <span class="sl">Identidad Institucional</span>
        <h2 class="st">
          Misión y Visión de {{ SITE.name }}
        </h2>
        <p class="sd">
          Principios que orientan nuestro trabajo técnico-jurídico y nuestra colaboración con
          clientes, instituciones y profesionales del país.
        </p>
      </div>
      <div class="mv-grid">
        <article class="mv-card reveal">
          <div class="mv-icon">
            <i
              aria-hidden="true"
              class="fa-solid fa-bullseye"
            />
          </div>
          <h3>Misión</h3>
          <p>
            Brindar asesoramiento técnico-jurídico y soluciones geoespaciales de alta precisión en
            derecho territorial, catastro, ordenamiento territorial, geodesia y software,
            articulando la normativa boliviana con ingeniería moderna para otorgar seguridad
            jurídica y solvencia técnica a ciudadanos, empresas, colegas e instituciones públicas.
          </p>
        </article>
        <article class="mv-card reveal">
          <div class="mv-icon">
            <i
              aria-hidden="true"
              class="fa-solid fa-eye"
            />
          </div>
          <h3>Visión</h3>
          <p>
            Consolidarnos como la firma y red interdisciplinaria referente en Bolivia en la
            convergencia entre Derecho e Ingeniería Territorial, impulsando estándares modernos de
            catastro multifinalitario, plataformas Web GIS y alianzas profesionales que eleven la
            calidad de la gestión territorial nacional.
          </p>
        </article>
      </div>
    </div>
  </section>

  <section class="sec-stripe">
    <div class="c">
      <div class="at-body">
        <h2>Metodología de intervención y competencias</h2>
        <p>
          Cada proyecto combina la revisión documental del derecho propietario y el marco normativo
          vigente con la verificación geométrica, catastral y cartográfica del territorio,
          evitando observaciones registrales y discrepancias técnicas ante Derechos Reales,
          gobiernos municipales e instituciones agrarias.
        </p>
        <div class="about-tags">
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-tractor"
          /> Derecho Agrario y Registral</span>
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-building-columns"
          /> Derecho Administrativo y Ambiental</span>
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-map"
          /> Catastro Multifinalitario</span>
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-compass-drafting"
          /> Ordenamiento Territorial</span>
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-mountain"
          /> Topografía y Geodesia GNSS</span>
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-layer-group"
          /> QGIS / ArcGIS / PostGIS</span>
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-server"
          /> GeoServer y Web GIS</span>
          <span class="about-tag"><i
            aria-hidden="true"
            class="fa-solid fa-code"
          /> Desarrollo de Software Territorial</span>
        </div>
        <div class="legal-note">
          <i
            aria-hidden="true"
            class="fa-solid fa-location-dot"
          />
          <p>
            Sede en {{ SITE.location }}, con atención presencial en el departamento de La Paz y
            consultoría colaborativa remota en los nueve departamentos de Bolivia.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
