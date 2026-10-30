/**
 * A jelenetek rajzai, jelenetenként külön letöltve.
 *
 * A nyolc jelenet együtt több mint kétmillió karakter SVG — a kezdőlapra
 * betöltve ez a legnagyobb tétel. Ezért minden jelenet rajza a saját
 * darabjában él, és csak akkor töltődik le, amikor a tanár tényleg azt a
 * jelenetet nyitja meg (vagy a menüben fölé viszi a kurzort): így az első
 * betöltés gyors marad iskolai Chromebookon is.
 *
 * A betöltött rajz közös: a Jelenet, a gyűjtemény és a Halloween-előnézet
 * ugyanazt a példányt olvassa, egyszer letöltve.
 */

import type { SceneId } from "./types";

export interface SceneArt {
  /** Élőlények, slug szerint. */
  creatureArt: Record<string, string>;
  /** Ugyanazok, előrefelé fordulva: szünetben ezt látja az osztály. */
  listeningArt: Record<string, string>;
  /** A háttér és a környező élet darabjai. */
  ambientArt: Record<string, string>;
}

/**
 * Jelenetenként egy dinamikus import. Szándékosan lusta: ha itt statikus
 * import állna, minden rajz visszakerülne a fő csomagba, és a bontás
 * értelmét vesztené.
 */
const loaders: Record<SceneId, () => Promise<SceneArt>> = {
  savanna: () =>
    import("./savanna/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      listeningArt: art.LISTENING_ART,
      ambientArt: art.AMBIENT_ART,
    })),
  reef: () =>
    import("./reef/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      listeningArt: art.LISTENING_ART,
      ambientArt: art.AMBIENT_ART,
    })),
  space: () =>
    import("./space/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      // A mélyűrben nincs mi előrefelé forduljon: szünetben minden mozdulatlan.
      listeningArt: {},
      ambientArt: art.AMBIENT_ART,
    })),
  prehistoric: () =>
    import("./prehistoric/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      listeningArt: art.LISTENING_ART,
      ambientArt: art.AMBIENT_ART,
    })),
  forest: () =>
    import("./forest/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      listeningArt: art.LISTENING_ART,
      ambientArt: art.AMBIENT_ART,
    })),
  jungle: () =>
    import("./jungle/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      listeningArt: art.LISTENING_ART,
      ambientArt: art.AMBIENT_ART,
    })),
  arctic: () =>
    import("./arctic/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      listeningArt: art.LISTENING_ART,
      ambientArt: art.AMBIENT_ART,
    })),
  halloween: () =>
    import("./halloween/artwork").then((art) => ({
      creatureArt: art.CREATURE_ART,
      listeningArt: art.LISTENING_ART,
      ambientArt: art.AMBIENT_ART,
    })),
};

/** A már letöltött rajzok; reaktív, hogy a Jelenet a maga idejében rajzoljon. */
const cache = $state<Partial<Record<SceneId, SceneArt>>>({});
/** Folyamatban lévő letöltések: ugyanazt a darabot ne kérjük kétszer. */
const pending: Partial<Record<SceneId, Promise<SceneArt>>> = {};

/** A jelenet rajza, ha már letöltődött — a hívó ilyenkor azonnal rajzolhat. */
export function sceneArt(id: SceneId): SceneArt | undefined {
  return cache[id];
}

/** A jelenet rajzának betöltése, egyszer. Ismételt hívás ugyanazt várja. */
export function ensureSceneArt(id: SceneId): Promise<SceneArt> {
  const ready = cache[id];
  if (ready) return Promise.resolve(ready);

  const inFlight = pending[id];
  if (inFlight) return inFlight;

  const request = loaders[id]()
    .then((art) => {
      cache[id] = art;
      delete pending[id];
      return art;
    })
    .catch((error: unknown) => {
      // Egy hiányzó darab ne akassza meg az órát: a hívó üres jelenetet kap,
      // és a következő próbálkozás újra letöltheti.
      delete pending[id];
      throw error;
    });

  pending[id] = request;
  return request;
}
