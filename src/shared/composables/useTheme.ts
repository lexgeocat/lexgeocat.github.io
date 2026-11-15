import { ref, watch } from 'vue'

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
