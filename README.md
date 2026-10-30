# Csendvadász

Nyugodt jelenet a tanterem kivetítőjén: szavanna, korallzátony, mélyűr,
dinoszauruszok kora, erdei tisztás, dzsungel vagy jeges tenger — ahol félénk
állatok jönnek elő, minél tovább marad csendes a terem. Ha túl hangos a terem,
rejtve maradnak, míg újra csend nem lesz.

A **Shy Safari** (teacher.dev) magyar fordítása és továbbfejlesztése, önálló,
statikus webalkalmazásként. Apache License 2.0 — lásd `LICENSE.txt` és
`NOTICE.md` (a módosítások listájával).

- Éles cím: <https://csendvadasz.vercel.app>
- Forráskód: <https://github.com/farkasszte/csendvadasz>
- Kapcsolat: **Farkas Gergely** — <farkas.szte@gmail.com>

## Mi ez

A pattogó hangerőmérő ellentéte: nincs pontszám, nincs mutató, nincs piros
figyelmeztetés — semmi, ami érdekesebbé tenné a hangoskodást a csendnél. Az
osztály üres jelenettel indul, az első állat 10–20 csendes másodperc után jön
elő, utána néhány percenként egy, ha csend van.

Használat:

1. Nyisd meg az oldalt, és nyomd meg az **Indítás** gombot. A hangot a gép
   méri, nem rögzíti és nem küldi sehová.
2. Válassz jelenetet, majd munkajelleg-kártyát (Csend, Önálló munka, Pármunka,
   Csoportmunka). Mindegyik kártya a saját hangerő-célját és érkezési ritmusát
   mutatja („42% · 5 percenként egy”), és a kiválasztott kártyán a **Mentés**
   gombbal a mostani beállítások ráírhatók — megerősítés után.
3. Dolgozzon az osztály. Ha túl hangos lesz, a jelenet befelhősödik; a
   beállításokban választható, hogy az állatok elszökjenek, vagy csak a jelenet
   álljon meg (alapértelmezés: megáll).

Nincs fiók, nincs regisztráció, nincs backend: a beállítások, a kalibrálás és
az osztályok gyűjteménye a böngésző helyi tárolójában marad meg.

---

# Fejlesztés

## Mielőtt elkezded

- **Bun** kell (nem npm): <https://bun.sh>. Ez futtatja a fejlesztői szervert, a
  teszteket és a buildet is.
- Nem kell adatbázis, fiók, API-kulcs vagy `.env` — az alkalmazás teljesen a
  böngészőben fut.
- A mikrofont a böngésző `localhost`-on engedi; idegen gépről nézve HTTPS kell.

## Első indítás három lépésben

```sh
bun install      # függőségek (egyszer)
bun run dev      # fejlesztői szerver, utána http://localhost:5173
```

A szerver futása közben mentés után az oldal magától frissül. Leállítás:
`Ctrl+C`.

Ha a kódot nem csak nézni, hanem beadni is szeretnéd, ugyanaz a négy parancs,
amit a CI is futtat:

```sh
bun run check    # típusellenőrzés (svelte-check) — ez fogja meg a hibák 90%-át
bun run lint     # formázás (prettier) + eslint
bun test         # egységtesztek (~980 db, kb. 1 másodperc)
bun run build    # éles build a build/ könyvtárba
```

Mind a négynek zöldnek kell lennie, mielőtt bármit feltöltesz.

## Parancsok

| Parancs           | Mit csinál                               | Mikor kell                    |
| ----------------- | ---------------------------------------- | ----------------------------- |
| `bun run dev`     | Fejlesztői szerver, élő újratöltéssel    | Fejlesztés közben             |
| `bun run check`   | TypeScript/Svelte típusellenőrzés        | Minden nagyobb módosítás után |
| `bun run lint`    | Prettier ellenőrzés + ESLint             | Commit előtt                  |
| `bun run format`  | Prettier formázás javítása               | Ha a lint formázást kifogásol |
| `bun test`        | Egységtesztek (logika, rajzok, szövegek) | Commit előtt                  |
| `bun run build`   | Statikus build a `build/`-be             | Deploy előtt                  |
| `bun run preview` | A kész build kiszolgálása helyben        | „Így néz ki élesben?”         |

## Hol van mi

```
src/routes/                   az oldalak (főoldal, /about, /privacy)
src/lib/app.svelte.ts         az alkalmazás állapota (melyik jelenet, fut-e a mérés)
src/lib/i18n/index.svelte.ts  MINDEN látható szöveg, nyelvenként (en/es/fr/hu)
src/lib/settings/             a tanár beállításai + a munkajelleg-kártyák
src/lib/audio/                mikrofon, kalibrálás, mérés, csengő
src/lib/noise/                mikor számít a terem „túl hangosnak”
src/lib/session/              állatérkezés, ritkaság-sorsolás, mentett jelenet
src/lib/scenes/               a nyolc jelenet: névjegyzék, rajzok, animációk
src/lib/components/           a felület darabjai (mérő, kártyák, panel, gyűjtemény)
static/                       favicon, előnézeti kép, robots.txt, llms.txt
docs/adr/                     az eredeti projekt döntései (miért ilyen a működés)
```

Három szabály, ami megkönnyíti az eligazodást:

1. **Minden felirat az `i18n` fájlban van**, nem a komponensekben. Ha szöveget
   látsz a felületen, azt ott keresd.
2. **Amit a tanár állít, az a `settings/`-ben él**, és a böngésző tárolójában
   marad meg — nincs szerver, ami elmentené.
3. **A jelenetek rajza lustán töltődik** (`scenes/art.svelte.ts`). Ezért nincs
   `import` a `scenes/*/artwork` fájlokra: az visszahúzná az összes rajzot az
   első betöltésbe.

## Gyakori feladatok

**Szöveg módosítása.** Keresd meg a kulcsot a `src/lib/i18n/index.svelte.ts`
`hu` blokkjában, és írd át. Ha új szöveget teszel be, mind a négy nyelvbe fel
kell venni, különben a `bun run check` elhasal — ez szándékos: így nem marad
angol felirat a magyar felületen.

**Munkajelleg-kártya értékének állítása.** A gyári értékek a
`src/lib/settings/settings.svelte.ts` `DEFAULT_WORK_TYPES`-ében vannak (cél % +
érkezés perc). A tanár a felületen maga is felülírhatja és elmentheti; a gyári
érték csak a legelső indításhoz kell.

**Új jelenet.** Ez a legnagyobb munka: SVG-készlet a `scenes/<név>/creatures/`
alá, névjegyzék (`roster.ts`), környező élet (`AmbientLife.svelte`), saját CSS,
és egy bejegyzés a `scenes/art.svelte.ts` betöltőiben. A rajzolási szabályok a
`docs/svg-art-brief.md`-ben.

**Új nyelv.** A `hu` blokk mintája alapján: másold le, fordítsd, vedd fel a
`LanguageCode` típusba és a `languages` térképbe. A hiányzó kulcs típushiba,
futásidőben pedig angolra esik vissza.

## Hogyan épül fel

Svelte 5 + SvelteKit, statikusra előrenderelve (`@sveltejs/adapter-static`),
Tailwind v4-gyel. Nincs backend és nincs futásidejű függőség: a `build/`
statikus fájlokból áll.

A jelenetek SVG-k a DOM-ban (nem videó, nem canvas), ezért minden állat
közönséges elem, amit CSS animál — lásd `docs/adr/0002-svg-dom-scene.md`.

A három legfontosabb döntés tiszta függvény, egységteszttel, tehát mikrofon és
várakozás nélkül ellenőrizhető:

- `src/lib/noise/loudState.ts` — a lassan be-, gyorsan kikapcsoló hiszterézis
  (egy kopogás nem számít, a tartós zaj igen).
- `src/lib/session/arrivalClock.ts` — a csendes idő „bankolása”: a hangos
  percek csak annyit vesznek el, amennyit tartottak.
- `src/lib/session/roll.ts` — a ritkaság szerinti súlyozott sorsolás.

A mérés a böngésző mikrofonjából jön, kikapcsolt böngésző-oldali
hangfeldolgozással (`src/lib/audio/measurement.ts`): az automatikus erősítés
ugyanis épp a hangos teremben mérne alá. A szint 0–100-as relatív skála, nem
dB — a vonal a viszonyítási pont, amit a tanár állít.

## Deploy

A Vercel a `main` ágra van kötve, push után magától épít:

```sh
git add -A
git commit -m "fix(meter): ..."
git push
```

A build kimenete a `build/` (`vercel.json` → `outputDirectory`). Szerver nincs,
környezeti változó nem kell.

Ha a cím megváltozik (saját domain), **három helyen** kell átírni:
`src/lib/site.ts` (`SITE_URL`), `static/robots.txt`, `static/llms.txt`. A
kanonikus link, a sitemap és a megosztási előnézet innen jön.

## Ha valami nem indul

- **A build „EPERM: permission denied” hibával elszáll** → fut egy helyi
  statikus szerver a `build/` könyvtárban; állítsd le, vagy használj másik
  portot.
- **Nincs hang, a mérés 0%** → a böngésző megtagadta a mikrofont (címsor
  ikonja), vagy másik bemenet van kiválasztva a beállításokban.
- **A `bun run check` ismeretlen kulcsot jelez** → hiányzó fordítás valamelyik
  nyelven; a hibaüzenet megmondja, melyik kulcs hiányzik.

---

## Ami eltér az eredetitől

A teljes lista a `NOTICE.md`-ben. Röviden: magyar nyelv (alapértelmezés), saját
márka és logó, analitika nélkül, kikapcsolt böngésző-oldali hangfeldolgozás a
megbízhatóbb mérésért, menthető munkajelleg-kártyák („Csoportmunka” az idősebb
korosztálynak), valamint kódos mentés/betöltés az osztályokhoz (másik gép,
vendégprofil).

## Következő lépések

- Valódi termi próba: a négy kártya gyári értéke (15/30/50/65%) a helyszínen
  finomítható, mérés után.
- A beállítások jelenleg a böngésző tárolójában élnek: osztályonkénti
  kártya-készlet (több osztály, más terem) későbbi kérdés.

## Köszönet

Az eredeti alkalmazást a **teacher.dev** csapata készítette a 2026-os
EdTech-a-thonon, és Apache-2.0 licenc alatt tette közzé:
<https://github.com/teacherdotdev/shy-safari>. A jelenetek, grafikák, a mérés
logikája és a szövegek alapja az ő munkájuk.

A magyar változat gondozója: **Farkas Gergely** — <farkas.szte@gmail.com>.
