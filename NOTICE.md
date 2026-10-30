# NOTICE — Csendvadász, magyar változat

Ez a projekt a **Shy Safari** nyílt forráskódú tantermi alkalmazás magyar
fordítása és továbbfejlesztése.

- Eredeti projekt: <https://github.com/teacherdotdev/shy-safari>
- Eredeti készítők: **teacher.dev** (<https://teacher.dev>), az EdTech-a-thon
  közösségi eseményén készült prototípusból
- Licenc: **Apache License, Version 2.0** — a teljes szöveg a `LICENSE.txt`-ben
- A magyar változat gondozója: **Farkas Gergely** — <farkas.szte@gmail.com>

  This product includes software developed at teacher.dev, published as
  "Shy Safari" under the Apache License, Version 2.0.

A licenc 4(a) pontja szerint az alábbi fájlokat módosítottuk, és a
módosított fájlok élén egy egysoros megjegyzés jelzi ezt. A licenc 6. pontja
szerint a licenc **védjegyhasználati jogot nem ad**: az eredeti projekt neve,
logója és a teacher.dev, illetve az EdTech-a-thon márkajelei nem kerültek át,
és ezeket ez a változat nem használja.

## A módosítások listája

1. **Magyar nyelv.** Új `hu` nyelvi blokk a `src/lib/i18n/index.svelte.ts`-ben
   (kb. 365 szöveg, élőlénynevek, egy-egy mondatos tények, jelenet-szövegek),
   a magyar az alapértelmezett nyelv. Az `en`, `es`, `fr` nyelvek változatlanok,
   csak az új kulcsokat kapták meg.
2. **Márkázás.** Shy Safari → Csendvadász: saját logó (`src/lib/brand/logo.svg`),
   favicon, Apple-touch-icon és közösségi előnézeti kép
   (`static/favicon.svg`, `favicon.png`, `apple-touch-icon.png`, `og-image.png`),
   valamint `SITE_URL`, `robots.txt`, `llms.txt`, sitemap, strukturált adatok és
   oldalcímek. Az `edtechathon-logo.svg`, az `edtechathon-2026.jpg` és az eredeti
   `logo.svg` törölve.
3. **Analitika nélkül.** A Cloudflare Web Analytics beacon eltávolítva
   (`src/routes/+layout.svelte`, `vite.config.ts`), az adatvédelmi oldal szövege
   ennek megfelelően módosult.
4. **Mérés javítása.** A mikrofon mostantól kikapcsolt böngésző-oldali
   hangfeldolgozással mér (`autoGainControl`, `noiseSuppression`,
   `echoCancellation` ki), mert az automatikus erősítés épp a hangos teremben
   mér alá. Új fájl: `src/lib/audio/measurement.ts` (+ teszt),
   módosítva: `src/lib/audio/microphone.svelte.ts`.
5. **Idősebb korosztály.** Új munkajelleg-kártya „Csoportmunka” (65%) a
   `src/lib/settings/settings.svelte.ts`-ben; alapértelmezés: a jelenet megáll
   (`loudResponse: "pause"`). A hangerőmérő kivetítése az eredetinek megfelelően
   **kikapcsolt** (`showMeter: false`).
6. **Osztályok kódba mentése.** Új fájlok: `src/lib/classes/backup.ts`
   (+ teszt), a `classes.svelte.ts` `exportCode()` / `importCode()` metódusa,
   és a felület a `ClassesPanel.svelte`-ben — így a gyűjtemény másik gépre is
   átvihető, szerver és fiók nélkül.
7. **Oldalak.** A „A projektről” oldal új, licenc- és köszönetmondattal, az
   adatvédelmi oldal hivatkozásai a licence, illetve a projekt oldalára
   mutatnak.
8. **Munkajelleg-kártyák mentéssel.** A négy kártya (Csend, Önálló munka,
   Pármunka, Csoportmunka) saját hangerő-célt és érkezési ritmust tart, és a
   kártyán meg is jeleníti („42% · 5 percenként egy”). A kiválasztott kártyán
   egy **Mentés** gomb a mostani beállításokat megerősítés után ráírja a
   kártyára; kiválasztáskor a mentett értékek lépnek életbe
   (`settings.svelte.ts` `workTypes`/`useWorkType`/`saveWorkType`,
   `SettingsPanel.svelte`). Az „Elmélyült” érkezési preset ezért kikerült: a
   ritmust a kártya tartja.
9. **Aktuális zajszint kijelzése.** A mérő a pillanatnyi szintet számmal is
   mutatja (`LevelMeter.svelte`), hogy a tanár ahhoz tudja állítani a vonalat.
   dB-átalakítás nincs: a szint relatív, a vonal a referencia.
10. **Kódbontás jelenetenként.** A jelenetek rajza külön darabban töltődik
    (`scenes/art.svelte.ts`), így a belépő kliens csomag ~2 MB helyett
    ~240 kB. Ehhez a `SceneDef` már nem tartalmazza a rajzokat, az
    `AmbientLife` komponensek propként kapják (`scenes/*/AmbientLife.svelte`),
    a Halloween-naptár pedig nem olvassa a rajzot (`halloween/arrivals.ts`).

## Módosított fájlok```

src/app.html
src/lib/audio/microphone.svelte.ts
src/lib/brand/logo.svg (új tartalom)
src/lib/classes/backup.ts (új)
src/lib/classes/backup.test.ts (új)
src/lib/classes/classes.svelte.ts
src/lib/components/BrandChip.svelte
src/lib/components/ClassesPanel.svelte
src/lib/components/DocPage.svelte
src/lib/components/PageMeta.svelte
src/lib/audio/measurement.ts (új)
src/lib/audio/measurement.test.ts (új)
src/lib/i18n/index.svelte.ts
src/lib/settings/settings.svelte.ts
src/lib/site.ts
src/routes/+layout.svelte
src/routes/+page.svelte
src/routes/about/+page.svelte
src/routes/privacy/+page.svelte
static/favicon.svg (új tartalom)
static/favicon.png (új)
static/apple-touch-icon.png (új)
static/og-image.png (új)
static/llms.txt (új tartalom)
static/robots.txt (új tartalom)
vite.config.ts
package.json
README.md

```

```
