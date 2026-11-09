const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api'

/** Backend origin, used for locally stored `/uploads/...` images. */
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function assetUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  if (/^https?:\/\//.test(url) || url.startsWith('data:')) return url
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}
