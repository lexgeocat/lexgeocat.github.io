const servicioImageModules = import.meta.glob<string>(
  '../assets/img/servicios/*.{webp,png,jpg,jpeg}',
  { eager: true, query: '?url', import: 'default' },
)

const servicioImageByName: Record<string, string> = (() => {
  const map: Record<string, string> = {}
  for (const [path, url] of Object.entries(servicioImageModules)) {
    const file = path.split('/').pop()
    if (file) map[file] = url
  }
  return map
})()

export function resolveServicioImageUrl(value: string | null | undefined): string | null {
  if (!value) return null
  if (/^https?:\/\//.test(value)) return value
  const file = value.split('/').pop()
  if (!file) return null
  return servicioImageByName[file] ?? null
}
