import { onUnmounted, type Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(container: Ref<HTMLElement | null>) {
  let lastFocused: HTMLElement | null = null

  function focusable(): HTMLElement[] {
    const el = container.value
    if (!el) return []
    return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => node.offsetParent !== null,
    )
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return
    const items = focusable()
    if (!items.length) return
    const first = items[0]!
    const last = items[items.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  function activate() {
    lastFocused = document.activeElement as HTMLElement
    document.addEventListener('keydown', onKeydown)
    requestAnimationFrame(() => focusable()[0]?.focus())
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown)
    lastFocused?.focus()
    lastFocused = null
  }

  onUnmounted(() => document.removeEventListener('keydown', onKeydown))

  return { activate, deactivate }
}
