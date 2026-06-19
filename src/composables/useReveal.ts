export function useReveal() {
  let rIO: IntersectionObserver | null = null

  function observe() {
    if (typeof IntersectionObserver === 'undefined') return
    rIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.transitionDelay = `${(i % 4) * 0.1}s`
            entry.target.classList.add('visible')
            rIO?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    ;(window as any).__lgcReveal = rIO
    document.querySelectorAll('.reveal').forEach((el) => rIO?.observe(el))
  }

  function disconnect() {
    rIO?.disconnect()
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
      { threshold: 0.5 }
    )
    document.querySelectorAll('.hstat-n[data-count]').forEach((el) => cIO?.observe(el))
  }

  function disconnect() {
    cIO?.disconnect()
  }

  return { observe, disconnect }
}
