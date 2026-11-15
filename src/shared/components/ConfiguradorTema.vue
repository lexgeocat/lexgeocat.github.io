<script setup lang="ts">
import { computed } from 'vue'
import {
  PERFILES_TEMAS,
  PRESETS,
  PRIMARIOS,
  SUPERFICIES,
  type ConfigTema,
} from '../theme/tema'
import { useTheme } from '../composables/useTheme'
import IconoTema from './IconoTema.vue'

const props = withDefaults(
  defineProps<{
    variante?: 'pagina' | 'popover'
  }>(),
  {
    variante: 'popover',
  },
)

const emit = defineEmits<{
  cerrar: []
}>()

const { config, esOscuro, actualizar, aplicarPerfil } = useTheme()

const pActivo = computed(
  () => PRIMARIOS.find((x) => x.id === config.value.primary) ?? PRIMARIOS[0],
)
const sActiva = computed(
  () => SUPERFICIES.find((x) => x.id === config.value.surface) ?? SUPERFICIES[0],
)
const prActivo = computed(
  () => PRESETS.find((x) => x.id === config.value.preset) ?? PRESETS[0],
)

function configsIguales(a: ConfigTema, b: ConfigTema): boolean {
  return (
    a.colorScheme === b.colorScheme &&
    a.primary === b.primary &&
    a.surface === b.surface &&
    a.preset === b.preset &&
    a.layoutTheme === b.layoutTheme
  )
}

function primarioSwatch(id: ConfigTema['primary']): string {
  return (PRIMARIOS.find((x) => x.id === id) ?? PRIMARIOS[0]).swatch
}

function fondoMuestra(pf: (typeof PERFILES_TEMAS)[number]): string {
  const ss = SUPERFICIES.find((x) => x.id === pf.config.surface) ?? SUPERFICIES[0]
  return pf.config.colorScheme === 'dark' ? ss.oscuro.superficie : ss.claro.bg
}
</script>

<template>
  <div
    v-if="props.variante === 'popover'"
    class="tcfg-popover"
    role="dialog"
    aria-label="Configuración de tema"
  >
    <div class="tcfg-popover-cab">
      <div class="tcfg-popover-tit">
        <b>Apariencia y Tema</b>
        <span>{{ pActivo.nombre }} · {{ sActiva.nombre }}</span>
      </div>
      <button
        type="button"
        class="tcfg-close-btn"
        aria-label="Cerrar"
        @click="emit('cerrar')"
      >
        <i
          aria-hidden="true"
          class="fa-solid fa-xmark"
        />
      </button>
    </div>

    <div class="tcfg-popover-scroll">
      <div class="tcfg-cuerpo compacto">
        <!-- 1. Primary -->
        <div class="tcfg-grupo">
          <div class="tcfg-lbl-fila">
            <span class="tcfg-lbl">Primary</span>
            <span class="tcfg-val">{{ pActivo.nombre }}</span>
          </div>
          <div
            class="tcfg-swatches"
            role="radiogroup"
            aria-label="Color primario"
          >
            <button
              v-for="p in PRIMARIOS"
              :key="p.id"
              type="button"
              role="radio"
              :aria-checked="config.primary === p.id"
              class="tcfg-swatch"
              :class="{ sel: config.primary === p.id }"
              :style="{ '--sw': p.swatch }"
              :title="p.nombre"
              :aria-label="`Primary ${p.nombre}`"
              @click="actualizar({ primary: p.id })"
            >
              <span class="tcfg-swatch-dot" />
            </button>
          </div>
        </div>

        <!-- 2. Surface -->
        <div class="tcfg-grupo">
          <div class="tcfg-lbl-fila">
            <span class="tcfg-lbl">Surface</span>
            <span class="tcfg-val">{{ sActiva.nombre }}</span>
          </div>
          <div
            class="tcfg-swatches"
            role="radiogroup"
            aria-label="Superficie neutral"
          >
            <button
              v-for="s in SUPERFICIES"
              :key="s.id"
              type="button"
              role="radio"
              :aria-checked="config.surface === s.id"
              class="tcfg-swatch tcfg-swatch-surface"
              :class="{ sel: config.surface === s.id }"
              :title="s.nombre"
              :aria-label="`Surface ${s.nombre}`"
              @click="actualizar({ surface: s.id })"
            >
              <span
                class="tcfg-surface-split"
                :style="{
                  background: `linear-gradient(135deg, ${s.swatchTarjeta} 50%, ${s.swatchFondo} 50%)`,
                }"
              />
            </button>
          </div>
        </div>

        <!-- 3. Presets (Aura / Lara / Nora) -->
        <div class="tcfg-grupo">
          <div class="tcfg-lbl-fila">
            <span class="tcfg-lbl">Presets</span>
            <span class="tcfg-val">{{ prActivo.nombre }}</span>
          </div>
          <div
            class="tcfg-seg"
            role="radiogroup"
            aria-label="Preset geométrico"
          >
            <button
              v-for="pr in PRESETS"
              :key="pr.id"
              type="button"
              role="radio"
              :aria-checked="config.preset === pr.id"
              class="tcfg-seg-btn"
              :class="{ activo: config.preset === pr.id }"
              :title="pr.descripcion"
              @click="actualizar({ preset: pr.id })"
            >
              {{ pr.nombre }}
            </button>
          </div>
        </div>

        <!-- 4. Color Scheme -->
        <div class="tcfg-grupo">
          <div class="tcfg-lbl-fila">
            <span class="tcfg-lbl">Color Scheme</span>
            <span class="tcfg-val">{{ esOscuro ? 'Dark' : 'Light' }}</span>
          </div>
          <div
            class="tcfg-seg tcfg-seg-2"
            role="radiogroup"
            aria-label="Esquema de color"
          >
            <button
              type="button"
              role="radio"
              :aria-checked="!esOscuro"
              class="tcfg-seg-btn"
              :class="{ activo: !esOscuro }"
              @click="actualizar({ colorScheme: 'light' })"
            >
              <IconoTema
                tipo="tema"
                :oscuro="false"
                :tam="13"
              />
              <span>Light</span>
            </button>
            <button
              type="button"
              role="radio"
              :aria-checked="esOscuro"
              class="tcfg-seg-btn"
              :class="{ activo: esOscuro }"
              @click="actualizar({ colorScheme: 'dark' })"
            >
              <IconoTema
                tipo="tema"
                :oscuro="true"
                :tam="13"
              />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <!-- 5. Layout Theme -->
        <div class="tcfg-grupo">
          <div class="tcfg-lbl-fila">
            <span class="tcfg-lbl">Layout Theme</span>
            <span
              v-if="esOscuro"
              class="tcfg-badge-nota"
            >Solo en Light</span>
          </div>
          <div
            class="tcfg-radios"
            role="radiogroup"
            aria-label="Tema de estructura"
          >
            <label
              class="tcfg-radio-opt"
              :class="{ sel: config.layoutTheme === 'color-scheme' }"
            >
              <input
                type="radio"
                name="layout-theme-popover"
                :checked="config.layoutTheme === 'color-scheme'"
                @change="actualizar({ layoutTheme: 'color-scheme' })"
              >
              <span>Color Scheme</span>
            </label>
            <label
              class="tcfg-radio-opt"
              :class="{ sel: config.layoutTheme === 'primary', deshab: esOscuro }"
              :title="
                esOscuro
                  ? 'Disponible solo cuando Color Scheme está en Light'
                  : 'Aplica el color primario a la barra superior'
              "
            >
              <input
                type="radio"
                name="layout-theme-popover"
                :checked="config.layoutTheme === 'primary'"
                :disabled="esOscuro"
                @change="actualizar({ layoutTheme: 'primary' })"
              >
              <span>Primary Color <small>(Light Only)</small></span>
            </label>
          </div>
        </div>
      </div>

      <div class="tcfg-popover-perfiles">
        <div class="tcfg-lbl-fila">
          <span class="tcfg-lbl">Temas Premium</span>
          <span class="tcfg-val">4 curados</span>
        </div>
        <div class="tcfg-chips">
          <button
            v-for="pf in PERFILES_TEMAS"
            :key="pf.id"
            type="button"
            class="tcfg-chip"
            :class="{ sel: configsIguales(config, pf.config) }"
            :title="pf.subtitulo"
            @click="aplicarPerfil(pf.id)"
          >
            <i
              class="tcfg-chip-dot"
              :style="{ background: primarioSwatch(pf.config.primary) }"
              aria-hidden="true"
            />
            {{ pf.nombre }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else
    class="tcfg-panel-pagina"
  >
    <div class="tcfg-grid-pagina">
      <div class="tcfg-col-preview">
        <div
          class="tcfg-preview-live"
          aria-hidden="true"
        >
          <div class="tcfg-pv-top">
            <span class="tcfg-pv-dots">
              <i /><i /><i />
            </span>
            <span class="tcfg-pv-title">LEXGEOCAT · {{ prActivo.nombre }}</span>
          </div>
          <div class="tcfg-pv-body">
            <div class="tcfg-pv-nav">
              <div class="tcfg-pv-logo" />
              <div class="tcfg-pv-nav-item activo" />
              <div class="tcfg-pv-nav-item" />
              <div class="tcfg-pv-nav-item" />
            </div>
            <div class="tcfg-pv-workspace">
              <div class="tcfg-pv-head">
                <span class="tcfg-pv-h1" />
                <span class="tcfg-pv-btn" />
              </div>
              <div class="tcfg-pv-card">
                <div class="tcfg-pv-card-bar" />
                <div class="tcfg-pv-card-lines">
                  <span />
                  <span class="corto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tcfg-perfiles-bloque">
          <div class="tcfg-lbl-fila">
            <span class="tcfg-lbl">Temas Premium</span>
            <span class="tcfg-val">4 curados</span>
          </div>
          <div class="tcfg-perfiles-lista">
            <button
              v-for="pf in PERFILES_TEMAS"
              :key="pf.id"
              type="button"
              class="tcfg-perfil-card"
              :class="{ sel: configsIguales(config, pf.config) }"
              @click="aplicarPerfil(pf.id)"
            >
              <span
                class="tcfg-perfil-muestra"
                :style="{
                  background: fondoMuestra(pf),
                  borderColor: primarioSwatch(pf.config.primary),
                }"
              >
                <i :style="{ background: primarioSwatch(pf.config.primary) }" />
              </span>
              <span class="tcfg-perfil-txt">
                <b>{{ pf.nombre }}</b>
                <small>{{ pf.subtitulo }}</small>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="tcfg-col-ajustes">
        <div class="tcfg-cuerpo">
          <div class="tcfg-grupo">
            <div class="tcfg-lbl-fila">
              <span class="tcfg-lbl">Primary</span>
              <span class="tcfg-val">{{ pActivo.nombre }}</span>
            </div>
            <div
              class="tcfg-swatches"
              role="radiogroup"
              aria-label="Color primario"
            >
              <button
                v-for="p in PRIMARIOS"
                :key="p.id"
                type="button"
                role="radio"
                :aria-checked="config.primary === p.id"
                class="tcfg-swatch"
                :class="{ sel: config.primary === p.id }"
                :style="{ '--sw': p.swatch }"
                :title="p.nombre"
                :aria-label="`Primary ${p.nombre}`"
                @click="actualizar({ primary: p.id })"
              >
                <span class="tcfg-swatch-dot" />
              </button>
            </div>
          </div>

          <div class="tcfg-grupo">
            <div class="tcfg-lbl-fila">
              <span class="tcfg-lbl">Surface</span>
              <span class="tcfg-val">{{ sActiva.nombre }}</span>
            </div>
            <div
              class="tcfg-swatches"
              role="radiogroup"
              aria-label="Superficie neutral"
            >
              <button
                v-for="s in SUPERFICIES"
                :key="s.id"
                type="button"
                role="radio"
                :aria-checked="config.surface === s.id"
                class="tcfg-swatch tcfg-swatch-surface"
                :class="{ sel: config.surface === s.id }"
                :title="s.nombre"
                :aria-label="`Surface ${s.nombre}`"
                @click="actualizar({ surface: s.id })"
              >
                <span
                  class="tcfg-surface-split"
                  :style="{
                    background: `linear-gradient(135deg, ${s.swatchTarjeta} 50%, ${s.swatchFondo} 50%)`,
                  }"
                />
              </button>
            </div>
          </div>

          <div class="tcfg-grupo">
            <div class="tcfg-lbl-fila">
              <span class="tcfg-lbl">Presets</span>
              <span class="tcfg-val">{{ prActivo.nombre }}</span>
            </div>
            <div
              class="tcfg-seg"
              role="radiogroup"
              aria-label="Preset geométrico"
            >
              <button
                v-for="pr in PRESETS"
                :key="pr.id"
                type="button"
                role="radio"
                :aria-checked="config.preset === pr.id"
                class="tcfg-seg-btn"
                :class="{ activo: config.preset === pr.id }"
                :title="pr.descripcion"
                @click="actualizar({ preset: pr.id })"
              >
                {{ pr.nombre }}
              </button>
            </div>
          </div>

          <div class="tcfg-grupo">
            <div class="tcfg-lbl-fila">
              <span class="tcfg-lbl">Color Scheme</span>
              <span class="tcfg-val">{{ esOscuro ? 'Dark' : 'Light' }}</span>
            </div>
            <div
              class="tcfg-seg tcfg-seg-2"
              role="radiogroup"
              aria-label="Esquema de color"
            >
              <button
                type="button"
                role="radio"
                :aria-checked="!esOscuro"
                class="tcfg-seg-btn"
                :class="{ activo: !esOscuro }"
                @click="actualizar({ colorScheme: 'light' })"
              >
                <IconoTema
                  tipo="tema"
                  :oscuro="false"
                  :tam="13"
                />
                <span>Light</span>
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="esOscuro"
                class="tcfg-seg-btn"
                :class="{ activo: esOscuro }"
                @click="actualizar({ colorScheme: 'dark' })"
              >
                <IconoTema
                  tipo="tema"
                  :oscuro="true"
                  :tam="13"
                />
                <span>Dark</span>
              </button>
            </div>
          </div>

          <div class="tcfg-grupo">
            <div class="tcfg-lbl-fila">
              <span class="tcfg-lbl">Layout Theme</span>
              <span
                v-if="esOscuro"
                class="tcfg-badge-nota"
              >Solo en Light</span>
            </div>
            <div
              class="tcfg-radios"
              role="radiogroup"
              aria-label="Tema de estructura"
            >
              <label
                class="tcfg-radio-opt"
                :class="{ sel: config.layoutTheme === 'color-scheme' }"
              >
                <input
                  type="radio"
                  name="layout-theme-pagina"
                  :checked="config.layoutTheme === 'color-scheme'"
                  @change="actualizar({ layoutTheme: 'color-scheme' })"
                >
                <span>Color Scheme</span>
              </label>
              <label
                class="tcfg-radio-opt"
                :class="{ sel: config.layoutTheme === 'primary', deshab: esOscuro }"
              >
                <input
                  type="radio"
                  name="layout-theme-pagina"
                  :checked="config.layoutTheme === 'primary'"
                  :disabled="esOscuro"
                  @change="actualizar({ layoutTheme: 'primary' })"
                >
                <span>Primary Color <small>(Light Only)</small></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
