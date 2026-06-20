export function toDirectImageUrl(url: string): string {
  if (!url) return ''
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  return m ? 'https://drive.google.com/uc?id=' + m[1] : url
}
