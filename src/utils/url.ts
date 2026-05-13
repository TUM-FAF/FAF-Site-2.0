const RAW_BASE = import.meta.env.BASE_URL;
const BASE = RAW_BASE.endsWith('/') ? RAW_BASE : RAW_BASE + '/';

export function withBase(href?: string | null): string {
  if (!href) return BASE;
  if (/^([a-z][a-z0-9+.-]*:|#)/i.test(href)) return href;
  const path = href.startsWith('/') ? href.slice(1) : href;
  return BASE + path;
}
