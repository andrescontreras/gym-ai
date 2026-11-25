const PLACEHOLDER_ORIGIN = 'http://local.invalid'
const LOOPING_PATHS = ['/login', '/signup']

export function getSafeNext(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  if (/[\x00-\x1f\x7f\\]/.test(value)) return fallback

  let url: URL
  try {
    url = new URL(value, PLACEHOLDER_ORIGIN)
  } catch {
    return fallback
  }
  if (url.origin !== PLACEHOLDER_ORIGIN) return fallback
  if (LOOPING_PATHS.includes(url.pathname)) return fallback

  return value
}
