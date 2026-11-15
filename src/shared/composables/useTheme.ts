import { computed, getCurrentInstance, onUnmounted, ref } from 'vue'
import {
  actualizarConfigTema,
  alternarColorScheme,
  aplicarPerfilTema,
  aplicarTemaAlDocumento,
  obtenerConfigTema,
  suscribirConfigTema,
  type ColorScheme,
  type ConfigTema,
} from '../theme/tema'

const config = ref<ConfigTema>(obtenerConfigTema())

// Aplicación síncrona inicial para evitar parpadeos de color al arrancar.
aplicarTemaAlDocumento(config.value)

let suscriptores = 0
let desuscribirGlobal: (() => void) | null = null

export function initTheme(): void {
  const actual = obtenerConfigTema()
  config.value = actual
  aplicarTemaAlDocumento(actual)
}

export function useTheme() {
  if (suscriptores === 0 && !desuscribirGlobal) {
    desuscribirGlobal = suscribirConfigTema((c) => {
      config.value = c
    })
  }
  if (getCurrentInstance()) {
    suscriptores++
    onUnmounted(() => {
      suscriptores = Math.max(0, suscriptores - 1)
      if (suscriptores === 0 && desuscribirGlobal) {
        desuscribirGlobal()
        desuscribirGlobal = null
      }
    })
  }

  const esOscuro = computed(() => config.value.colorScheme === 'dark')

  function toggle(): ColorScheme {
    return alternarColorScheme()
  }

  function actualizar(parcial: Partial<ConfigTema>) {
    actualizarConfigTema(parcial)
  }

  function aplicarPerfil(id: string) {
    aplicarPerfilTema(id)
  }

  return {
    config,
    isDark: esOscuro,
    esOscuro,
    toggle,
    alternarEsquema: toggle,
    actualizar,
    aplicarPerfil,
  }
}
