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

## Ami eltér az eredetitől

A teljes lista a `NOTICE.md`-ben. Röviden: magyar nyelv (alapértelmezés), saját
márka és logó, analitika nincs, menthető munkajelleg-kártyák, valamint kódos mentés/betöltés az osztályokhoz.

## Köszönet

Az eredeti alkalmazást a **teacher.dev** csapata készítette a 2026-os
EdTech-a-thonon, és Apache-2.0 licenc alatt tette közzé:
<https://github.com/teacherdotdev/shy-safari>. A jelenetek, grafikák, a mérés
logikája és a szövegek alapja az ő munkájuk.

A magyar változat gondozója: **Farkas Gergely** — <farkas.szte@gmail.com>.
