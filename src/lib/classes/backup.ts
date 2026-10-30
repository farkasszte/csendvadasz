/**
 * Az osztályok kódba mentése és visszatöltése — szerver nélkül.
 *
 * Minden osztály adata a böngésző helyi tárolójában él, ezen a gépen. Ez a
 * legtöbb tanteremben elég, de nem mindenhol: a tanári gép cserélődhet, a
 * diákprofil vendég módban indulhat, a böngésző adatai pedig egy tisztítással
 * eltűnhetnek. Ezért a gyűjtemény kivihető egy kódban, és egy másik gépen
 * visszatölthető.
 *
 * A kód a báz64-be csomagolt JSON, URL-barát ábécével, hogy később QR-kódba is
 * beleférjen. Csak az osztályokhoz tartozó kulcsok kerülnek bele: a mikrofon,
 * a kalibrálás és a hangerő-cél a teremhez tartozik, nem az osztályhoz.
 */

import type { ClassInfo } from "./classList";

const LIST_KEY = "class-noise-level:classes";
const CLASS_PREFIX = "class-noise-level:class:";
const SIGHTINGS_PART = "sightings";

/** A kód formátumának verziója; idegen vagy újabb kódot nem töltünk be. */
export const BACKUP_VERSION = 1;

export interface ClassBackup {
  v: typeof BACKUP_VERSION;
  classes: ClassInfo[];
  currentId: string;
  /** A teljes, osztályokhoz tartozó tárolótartalom, kulcs szerint. */
  entries: Record<string, string>;
}

/** Igaz minden kulcsra, ami egy osztályhoz tartozik (a listához is). */
export function isClassStorageKey(key: string) {
  return key === LIST_KEY || key.startsWith(CLASS_PREFIX);
}

/**
 * A tároló bejárható tartalmából kódba való csomag. A lista hiányában is
 * működik: ilyenkor egyetlen, név nélküli osztály lesz a kódból.
 */
export function makeBackup(
  entries: Iterable<readonly [string, string]>,
): ClassBackup {
  const kept: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (isClassStorageKey(key)) kept[key] = value;
  }

  let classes: ClassInfo[] = [{ id: "", name: "" }];
  let currentId = "";
  try {
    const list = JSON.parse(kept[LIST_KEY] ?? "null") as {
      classes?: ClassInfo[];
      currentId?: string;
    } | null;
    if (list?.classes?.length) {
      classes = list.classes.map((info) => ({
        id: String(info.id),
        name: String(info.name ?? ""),
      }));
      currentId = String(list.currentId ?? classes[0].id);
    }
  } catch {
    // Sérült lista: a kód akkor is átvihető, csak név nélkül.
  }

  if (!currentId) currentId = classes[0].id;

  return { v: BACKUP_VERSION, classes, currentId, entries: kept };
}

/** Hány különböző állatot látott összesen a kódban lévő osztályok közül. */
export function countSeenAnimals(entries: Record<string, string>): number {
  const slugs = new Set<string>();
  for (const [key, raw] of Object.entries(entries)) {
    if (!key.endsWith(`:${SIGHTINGS_PART}`)) continue;
    try {
      const counts = JSON.parse(raw) as Record<string, number>;
      for (const [compound, value] of Object.entries(counts)) {
        if (!value) continue;
        // A kulcs `jelenet:slug` alakú, a slug a kettőspont után jön.
        const slug = compound.slice(compound.indexOf(":") + 1);
        if (slug) slugs.add(slug);
      }
    } catch {
      // Egy olvashatatlan gyűjtemény ne akassza meg a többit.
    }
  }
  return slugs.size;
}

/** URL-barát báz64: `+` helyett `-`, `/` helyett `_`, kitöltés nélkül. */
function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(code: string) {
  const padded =
    code.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (code.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeBackup(backup: ClassBackup): string {
  return toBase64Url(JSON.stringify(backup));
}

/**
 * Kódból csomag. `null`, ha a kód nem olvasható: más verzió, más alkalmazás,
 * csonka másolás, vagy éppenséggel nem osztályadatok vannak benne.
 */
export function decodeBackup(code: string): ClassBackup | null {
  const trimmed = code.trim().replace(/\s+/g, "");
  if (trimmed.length < 8) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64Url(trimmed));
  } catch {
    return null;
  }

  const candidate = parsed as Partial<ClassBackup>;
  if (!candidate || candidate.v !== BACKUP_VERSION) return null;
  if (!Array.isArray(candidate.classes) || candidate.classes.length === 0) {
    return null;
  }
  if (typeof candidate.currentId !== "string") return null;

  const classes: ClassInfo[] = [];
  for (const info of candidate.classes) {
    if (!info || typeof info.id !== "string" || !info.id) return null;
    classes.push({ id: info.id, name: String(info.name ?? "") });
  }
  if (!classes.some((info) => info.id === candidate.currentId)) return null;

  const entries: Record<string, string> = {};
  const rawEntries = candidate.entries;
  if (!rawEntries || typeof rawEntries !== "object") return null;
  for (const [key, value] of Object.entries(rawEntries)) {
    if (!isClassStorageKey(key) || typeof value !== "string") return null;
    entries[key] = value;
  }

  return {
    v: BACKUP_VERSION,
    classes,
    currentId: candidate.currentId,
    entries,
  };
}
