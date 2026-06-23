export function useReveal() {
  let rIO: IntersectionObserver | null = null
  /** Set de nodos ya animados (no re-observar) */
  const animated = new WeakSet<Element>()

  /**
   * Asigna a cada elemento `.reveal` su posición visual real dentro de su
   * contenedor padre (`.reveal-group` opcional, si no, su padre directo).
   * El índice se guarda en `data-reveal-index` para que el CSS
   * `transition-delay: calc(var(--i) * 0.1s)` se aplique correctamente
   * independientemente del batch en que IntersectionObserver los entregue.
   */
  function assignIndices() {
    const groups = new Map<Element, Element[]>()
    document.querySelectorAll('.reveal').forEach((el) => {
      if (el.closest('[data-reveal-nogroup]')) {
        // Elemento sin agrupar → grupo propio
        const list = groups.get(el) ?? []
        list.push(el)
        groups.set(el, list)
        return
      }
      const parent = el.parentElement
      if (!parent) return
      const list = groups.get(parent) ?? []
      list.push(el)
      groups.set(parent, list)
    })
    for (const list of groups.values()) {
      list.forEach((el, i) => {
        // Custom property leída por CSS — funciona en todos los navegadores.
        ;(el as HTMLElement).style.setProperty('--reveal-i', String(i))
      })
    }
  }

  function observe() {
    if (typeof IntersectionObserver === 'undefined') return
    assignIndices()
    if (!rIO) {
      rIO = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.classList.add('visible')
            animated.add(entry.target)
            rIO?.unobserve(entry.target)
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
      )
      ;(window as unknown as Record<string, unknown>).__lgcReveal = rIO
    }
    document.querySelectorAll('.reveal').forEach((el) => {
      if (animated.has(el)) return
      rIO?.observe(el)
    })
  }

  function disconnect() {
    rIO?.disconnect()
    rIO = null
  }

  return { observe, disconnect }
}

export function useCounters() {
  let cIO: IntersectionObserver | null = null

  function observe() {
    if (typeof IntersectionObserver === 'undefined') return
    cIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const raw = el.getAttribute('data-count')
          if (!raw) return
          const target = parseInt(raw, 10)
          if (isNaN(target) || target <= 0) {
            cIO?.unobserve(el)
            return
          }
          const suffix = el.textContent?.replace(/[0-9]/g, '') || ''
          const dur = 1600
          const t0 = performance.now()
          function step(now: number) {
            const p = Math.min((now - t0) / dur, 1)
            el.textContent = `${Math.floor(target * (1 - Math.pow(1 - p, 3))) + suffix}`
            if (p < 1) requestAnimationFrame(step)
            else el.textContent = `${target}${suffix}`
          }
          requestAnimationFrame(step)
          cIO?.unobserve(el)
        })
      },
      { threshold: 0.5 },
    )
    document.querySelectorAll('.hstat-n[data-count]').forEach((el) => cIO?.observe(el))
  }

  function disconnect() {
    cIO?.disconnect()
  }

  return { observe, disconnect }
}
