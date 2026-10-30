# Csendvadász

Nyugodt jelenet a tanterem kivetítőjén: szavanna, korallzátony, mélyűr,
dinoszauruszok kora, erdei tisztás, dzsungel vagy jeges tenger — ahol félénk
állatok jönnek elő, minél tovább marad csendes a terem. Ha túl hangos a terem,
rejtve maradnak, míg újra csend nem lesz.

Ez a **Shy Safari** (teacher.dev) magyar fordítása és továbbfejlesztése,
önálló, statikus webalkalmazásként, Vercelre szánva. Apache License 2.0 —
lásd `LICENSE.txt` és `NOTICE.md` (a módosítások listájával).

## Mi ez

A pattogó hangerőmérő ellentéte: nincs pontszám, nincs mutató, nincs piros
figyelmeztetés — semmi, ami érdekesebbé tenné a hangoskodást a csendnél. Az
osztály üres jelenettel indul, az első állat 10–20 csendes másodperc után jön
elő, utána néhány percenként egy, ha csend van.

Az óra menete:

1. Nyisd meg az oldalt, és nyomd meg a **Mikrofon engedélyezése / Indítás**
   gombot. A hangot a gép méri, nem rögzíti és nem küldi sehová.
2. Válassz jelenetet, majd munkajelleg-kártyát (Csend, Önálló munka,
   Pármunka, Csoportmunka). Mindegyik kártya a saját hangerő-célját és érkezési
   ritmusát mutatja („42% · 5 percenként egy”), és a kiválasztott kártyán a
   **Mentés** gombbal a mostani beállítások ráírhatók — megerősítés után.
3. Dolgozzon az osztály. Ha túl hangos lesz, a jelenet befelhősödik; a
   beállításokban választható, hogy az állatok elszökjenek, vagy csak a jelenet
   álljon meg (alapértelmezés: megáll).

Nincs fiók, nincs regisztráció, nincs backend: a beállítások, a kalibrálás és
az osztályok gyűjteménye a böngésző helyi tárolójában marad meg.

## Futtatás

```sh
bun install
bun run dev      # fejlesztői szerver
bun run check    # típusellenőrzés (svelte-check)
bun test         # egységtesztek
bun run build    # statikus build a build/ könyvtárba
```

Deploy: a build kimenete statikus (`@sveltejs/adapter-static`,
`vercel.json` → `outputDirectory: "build"`), tehát a Vercelre git push-sal
kerül fel, szerver nélkül. **Deploy előtt** a `src/lib/site.ts`-ben a
`SITE_URL`-t a saját domainre kell állítani, és a `static/robots.txt`,
`static/llms.txt` ugyanezt a címet tartalmazza.

## Felépítés

Svelte 5 + SvelteKit, statikusra előrenderelve, Tailwind v4-gyel. Minden jelenet
SVG a DOM-ban (nem videó, nem canvas), ezért minden állat közönséges elem, amit
CSS animál — lásd `docs/adr/0002-svg-dom-scene.md`.

A három legfontosabb döntés tiszta függvény, egységteszttel:

- `src/lib/noise/loudState.ts` — a lassan be-, gyorsan kikapcsoló hiszterézis.
- `src/lib/session/arrivalClock.ts` — a csendes idő bankolása, szüneteltetés
  visszaállítás helyett.
- `src/lib/session/roll.ts` — a ritkaság szerinti súlyozott sorsolás.

A magyar szövegek egy helyen élnek: `src/lib/i18n/index.svelte.ts` (`hu` blokk).
Az angol a forrás: kulcsonként típuskényszer van, hiányzó fordítás típushiba,
futásidőben pedig angolra esik vissza.

## Ami eltér az eredetitől

A teljes lista a `NOTICE.md`-ben. Röviden: magyar nyelv (alapértelmezés),
saját márka és logó, analitika nélkül, kikapcsolt böngésző-oldali
hangfeldolgozás a megbízhatóbb mérésért, menthető munkajelleg-kártyák
(„Csoportmunka” az idősebb korosztálynak), valamint kódos mentés/betöltés az
osztályokhoz (másik gép, vendégprofil).

## Következő lépések

- dB-alapú szintskála a lineáris RMS helyett — ehhez valódi teremben mért
  referencia kell (a mostani `rms * 7` a hangos teremben telít).
- A beállítások jelenleg a böngésző tárolójában élnek: osztályonkénti
  kártya-készlet (több osztály, más terem) későbbi kérdés.

## Köszönet

Az eredeti alkalmazást a **teacher.dev** csapata készítette a 2026-os
EdTech-a-thonon, és Apache-2.0 licenc alatt tette közzé:
<https://github.com/teacherdotdev/shy-safari>. A jelenetek, grafikák, a mérés
logikája és a szövegek alapja az ő munkájuk.
