import { ref, watch } from 'vue'
import logonoche from '@/assets/img/logo-noche.png'
import logodia from '@/assets/img/logo-dia.png'

const THEME_KEY = 'lgc-theme'
const isDark = ref(true)

function getInitialTheme(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved === 'dark'
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return true
  } catch {}
  return true
}

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  const logo = document.getElementById('hdr-logo') as HTMLImageElement | null
  if (logo) logo.src = dark ? logonoche : logodia
}

export function useTheme() {
  isDark.value = getInitialTheme()
  applyTheme(isDark.value)

  watch(isDark, (val) => {
    applyTheme(val)
    try {
      localStorage.setItem(THEME_KEY, val ? 'dark' : 'light')
    } catch {}
  })

  function toggle() {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
