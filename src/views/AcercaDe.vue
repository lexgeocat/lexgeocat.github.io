<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useReveal } from '../shared/composables/useReveal'
import { SITE } from '../config/site'
import { FOUNDER_PROFILE, TEAM_BY_SPECIALTY, type TeamSpecialtyKey } from '../content/team'
import logoSib from '../assets/img/logo-sib.jpg'
import logoRpa from '../assets/img/logo-rpa.jpg'

const reveal = useReveal()
const selectedSpecialty = ref<TeamSpecialtyKey | 'all'>('all')

const filteredProfessionals = computed(() =>
  selectedSpecialty.value === 'all'
    ? TEAM_BY_SPECIALTY
    : TEAM_BY_SPECIALTY.filter((member) => member.specialtyKey === selectedSpecialty.value),
)

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
          <div
            v-if="FOUNDER_PROFILE.photo"
            class="about-img"
          >
            <img
              :src="FOUNDER_PROFILE.photo"
              :alt="FOUNDER_PROFILE.photoAlt"
            >
          </div>
          <div
            v-else
            class="about-img-ph"
          >
            <div>
              <i
                aria-hidden="true"
                class="fa-solid fa-user-tie about-img-ph-icon"
              />
              <div class="about-img-ph-name">
                {{ FOUNDER_PROFILE.name }}
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
            {{ FOUNDER_PROFILE.name }}
          </h1>
          <p class="about-subtitle">
            {{ FOUNDER_PROFILE.role }} · {{ SITE.name }}
          </p>
          <p>
            <strong>{{ SITE.name }}</strong> es una firma y plataforma interdisciplinaria con sede
            en <strong>{{ SITE.location }}</strong>, dedicada a integrar el derecho territorial con
            el catastro, el ordenamiento territorial, la topografía, la geomática y el desarrollo de
            software geoespacial para el contexto boliviano.
          </p>
          <p>
            Bajo la conducción de <strong>{{ FOUNDER_PROFILE.name }}</strong>
            ({{ FOUNDER_PROFILE.degrees.join('; ') }}), articulamos una red abierta de especialistas
            y profesionales colaboradores que se integran progresivamente por disciplina para
            atender proyectos de alta complejidad en todo el país.
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

  <section
    id="equipo-especialidades"
    class="sec"
  >
    <div class="c">
      <div class="sh center">
        <span class="sl">Equipo y Red Profesional</span>
        <h2 class="st">
          Profesionales por Especialidad
        </h2>
        <p class="sd">
          Espacio destinado a los especialistas y profesionales colaboradores que se integran a
          {{ SITE.name }} en cada una de nuestras siete áreas técnicas y jurídicas.
        </p>
      </div>

      <div
        class="team-filters"
        role="tablist"
        aria-label="Filtrar profesionales por especialidad"
      >
        <button
          type="button"
          class="team-filter-btn"
          :class="{ 'is-active': selectedSpecialty === 'all' }"
          @click="selectedSpecialty = 'all'"
        >
          Todas ({{ TEAM_BY_SPECIALTY.length }})
        </button>
        <button
          v-for="item in TEAM_BY_SPECIALTY"
          :key="item.id"
          type="button"
          class="team-filter-btn"
          :class="{ 'is-active': selectedSpecialty === item.specialtyKey }"
          @click="selectedSpecialty = item.specialtyKey"
        >
          <i
            aria-hidden="true"
            class="fa-solid"
            :class="item.icon"
          />
          {{ item.specialtyLabel }}
        </button>
      </div>

      <div class="team-profiles-grid">
        <div
          v-for="member in filteredProfessionals"
          :key="member.id"
          class="team-profile"
          :class="member.specialtyClass"
        >
          <div class="team-profile-photo">
            <img
              v-if="member.photo"
              :src="member.photo"
              :alt="`${member.name} — ${member.specialtyLabel}`"
              loading="lazy"
            >
            <div
              v-else
              class="team-profile-fallback"
            >
              <i
                aria-hidden="true"
                class="fa-solid fa-user"
              />
            </div>
          </div>
          <router-link
            :to="member.specialtyRoute"
            class="team-profile-spec"
          >
            <i
              aria-hidden="true"
              class="fa-solid"
              :class="member.icon"
            />
            {{ member.specialtyLabel }}
          </router-link>
          <p class="team-profile-name">
            {{ member.name }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <section class="sec-stripe">
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

  <section class="sec">
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
