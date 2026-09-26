/** Старые ссылки ?play=1 → чистый / с тем же ?c= */
export function applyLegacyPlayParamRedirect() {
  const url = new URL(window.location.href)
  if (url.searchParams.get('play') !== '1') return
  url.searchParams.delete('play')
  if (url.pathname !== '/') url.pathname = '/'
  window.history.replaceState({}, '', url.toString())
}
