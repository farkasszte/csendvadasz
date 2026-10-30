# Csendvadász — a magyar változat jegyzetei

Ez a repó a **Shy Safari** (teacher.dev, Apache-2.0) magyar fordítása és
továbbfejlesztése. Az alábbi szabályok a forkra vonatkoznak; a további rész az
eredeti projekt fejlesztői útmutatója, ami a technológiai döntésekben továbbra
is irányadó.

- **Márkanév és védjegy.** Az „Shy Safari" név, a logó és a teacher.dev /
  EdTech-a-thon márkajelek nem használhatók. A licenc (6. pont) védjegyjogot
  nem ad. Saját név: **Csendvadász**, saját logó: `src/lib/brand/logo.svg`.
- **Licenc-megfelelés.** Minden módosított forrásfájl élén ott a
  `Csendvadász: a magyar változat módosítása (lásd NOTICE.md)` megjegyzés, és a
  `NOTICE.md` sorolja fel a változásokat. Új módosításnál mindkettő frissül,
  a `LICENSE.txt` érintetlen marad.
- **Szövegek.** Minden felhasználónak látszó szöveg a
  `src/lib/i18n/index.svelte.ts`-ben él, nyelvenként. A magyar (`hu`) a
  termék nyelve; új kulcsot mind a négy nyelvbe fel kell venni, különben a
  típusellenőrzés elhasal (`Language` típus). Magyar helyesírás: mondatkezdő
  nagybetű, szám után egyes szám („{count} állat"), „az Apache" névelővel.
- **Nincs analitika.** Ne kerüljön vissza beacon, külső szkript vagy süti; az
  adatvédelmi oldal szövege ezt állítja.
- **Mérés.** A mikrofont mindig kikapcsolt böngésző-oldali hangfeldolgozással
  kérjük (`src/lib/audio/measurement.ts`), különben az AGC alámér a hangos
  teremben.
- **Rajzok bontása.** A jelenetek SVG-i szándékosan lusták
  (`scenes/art.svelte.ts`). Ne kerüljön vissza statikus `import` a
  `scenes/*/artwork` modulokra: az minden rajzot a fő csomagba húz, és
  elveszik a jelenetenkénti bontás.
- **Cím.** Deploy előtt a `src/lib/site.ts` `SITE_URL`-je, valamint a
  `static/robots.txt` és `static/llms.txt` címe a saját domainre állítandó.

---

# EdTech-a-thon Agent Instructions

This project was created as a prototype during the 3-day "EdTech-a-thon" event by a team with varying technical expertise. Now we want to host it long-term.

### Default Web App Tech Stack

- Runtime: Bun
- Package manager: Bun
- Language: Typescript
- Build tool: Vite-based tooling
- Linter: ESLint (for JS/TS projects)
- Formatter: Prettier (for JS/TS projects; by default, create a blank prettier config file that does not modify any settings)
- Framework: SvelteKit if using Svelte or Astro if not
- UI Library: Svelte
- UI / Styling: Tailwind CSS
- UI Rendering Method: Prefer DOM elements over canvas when possible for the sake of accessibility, using canvas only when it is unreasonable not to
- Data & Persistence: Follow this hierarchy — no data, then `localStorage`, then Supabase only if real accounts or shared persistence are strictly necessary
