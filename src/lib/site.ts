// Csendvadász: a magyar változat módosítása (lásd NOTICE.md)
/**
 * Hol él a Csendvadász a weben: a canonical hivatkozásokhoz, a
 * közösségi előnézetekhez, a strukturált adatokhoz és a sitemaphoz kell
 * abszolút cím. Deploy után ezt az egy sort kell a saját domainre állítani,
 * különben a keresők az oldalakat az eredeti projekt címének tulajdonítják.
 */

export const SITE_URL = "https://csendvadasz.vercel.app";

/** Every page a search engine should know about, in sitemap order. */
export const PAGES = ["/", "/about", "/privacy"] as const;

export type PagePath = (typeof PAGES)[number];

/**
 * The picture link previews show: the savanna with a few animals out and the
 * name over it. A 1200×630 capture of the real Scene, in `static/`.
 */
export const PREVIEW_IMAGE = `${SITE_URL}/og-image.png`;

export function absoluteUrl(path: PagePath): string {
  return new URL(path, SITE_URL).href;
}
