const PREVIEW_HOSTS = new Set(["localhost", "127.0.0.1"]);
const PREVIEW_HOST_SUFFIXES = [".vercel.app"];

/**
 * Черновые адреса (локальная сборка, *.vercel.app) закрыты от поисковиков,
 * чтобы в выдачу не попал дубль будущего боевого домена.
 */
export function isIndexable(site: URL | undefined): boolean {
  if (!site || PREVIEW_HOSTS.has(site.hostname)) {
    return false;
  }
  return !PREVIEW_HOST_SUFFIXES.some((suffix) => site.hostname.endsWith(suffix));
}
