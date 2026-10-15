// Renamed sites: an old host redirects to its new one, keeping path and query. Applied by
// `normalizeUrl`, so typed addresses, links, history, saved favorites and restored windows all
// land on the new host. v0.4 renamed Spaceport to Friendspace.

export const LEGACY_HOSTS: Readonly<Record<string, string>> = {
  'spaceport.example': 'friendspace.example',
};

/** The English names v0.2 saved with the default favorites of renamed sites, by old url. */
export const LEGACY_DEFAULT_FAVORITE_NAMES: Readonly<Record<string, string>> = {
  'http://spaceport.example/': 'Spaceport',
};

/** `http://<legacy host>/…` (with or without `www.`) → the same path on the new host. */
export function redirectLegacyUrl(url: string): string {
  const match = /^(https?:\/\/)(www\.)?([^/?#:]+)(.*)$/i.exec(url);
  if (!match) return url;
  const [, scheme = '', www = '', host = '', rest = ''] = match;
  const next = LEGACY_HOSTS[host.toLowerCase()];
  return next ? `${scheme}${www}${next}${rest}` : url;
}
