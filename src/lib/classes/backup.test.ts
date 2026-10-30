import { describe, expect, it } from "bun:test";
import {
  countSeenAnimals,
  decodeBackup,
  encodeBackup,
  makeBackup,
} from "./backup";

const LIST = JSON.stringify({
  classes: [
    { id: "a1", name: "9.b" },
    { id: "b2", name: "11.a" },
  ],
  currentId: "a1",
});

const ENTRIES: [string, string][] = [
  ["class-noise-level:classes", LIST],
  [
    "class-noise-level:class:a1:sightings",
    JSON.stringify({ "savanna:zebra": 2, "savanna:lion": 1 }),
  ],
  [
    "class-noise-level:class:b2:sightings",
    JSON.stringify({ "savanna:zebra": 1, "space:comet": 1 }),
  ],
  ["class-noise-level:class:a1:savanna", "[]"],
  // Nem osztályadatok: nem kerülhetnek a kódba.
  ["class-noise-level:settings", '{"scene":"reef"}'],
  ["unrelated", "x"],
];

describe("makeBackup", () => {
  it("csak az osztályokhoz tartozó kulcsokat pakolja be", () => {
    const backup = makeBackup(ENTRIES);

    expect(Object.keys(backup.entries).sort()).toEqual([
      "class-noise-level:class:a1:savanna",
      "class-noise-level:class:a1:sightings",
      "class-noise-level:class:b2:sightings",
      "class-noise-level:classes",
    ]);
  });

  it("megtartja az osztályneveket és a kiválasztott osztályt", () => {
    const backup = makeBackup(ENTRIES);

    expect(backup.classes.map((info) => info.name)).toEqual(["9.b", "11.a"]);
    expect(backup.currentId).toBe("a1");
  });

  it("sérült osztálylista mellett is készít kódot", () => {
    const backup = makeBackup([["class-noise-level:classes", "{oops"]]);

    expect(backup.classes).toHaveLength(1);
    expect(backup.currentId).toBe("");
  });
});

describe("countSeenAnimals", () => {
  it("az osztályok közti különböző állatokat számolja", () => {
    const animals = countSeenAnimals(makeBackup(ENTRIES).entries);

    expect(animals).toBe(3);
  });

  it("az olvashatatlan gyűjteményt kihagyja", () => {
    const animals = countSeenAnimals({
      "class-noise-level:class:a1:sightings": "{oops",
    });

    expect(animals).toBe(0);
  });
});

describe("encodeBackup / decodeBackup", () => {
  it("oda-vissza ugyanazt adja, ékezetekkel együtt", () => {
    const backup = makeBackup([
      [
        "class-noise-level:classes",
        JSON.stringify({
          classes: [{ id: "a1", name: "Április 3. — 9.b, fizika" }],
          currentId: "a1",
        }),
      ],
    ]);

    const decoded = decodeBackup(encodeBackup(backup));

    expect(decoded?.classes[0].name).toBe("Április 3. — 9.b, fizika");
    expect(decoded?.entries).toEqual(backup.entries);
  });

  it("a kód URL-barát, szóköz nélkül", () => {
    const code = encodeBackup(makeBackup(ENTRIES));

    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("a másolásból beszúrt sortöréseket és szóközöket elviseli", () => {
    const code = encodeBackup(makeBackup(ENTRIES));
    const wrapped = `${code.slice(0, 20)}\n  ${code.slice(20)}`;

    expect(decodeBackup(wrapped)).not.toBeNull();
  });

  it("elutasítja a szemét kódot", () => {
    expect(decodeBackup("nem-egy-kod")).toBeNull();
    expect(decodeBackup("")).toBeNull();
    expect(decodeBackup("aGVsbG8gdmlszYWc=")).toBeNull();
  });

  it("elutasítja a más verziójú kódot", () => {
    const older = { ...makeBackup(ENTRIES), v: 0 };

    expect(decodeBackup(encodeBackup(older as never))).toBeNull();
  });

  it("elutasítja, ha a kiválasztott osztály nincs a listában", () => {
    const broken = { ...makeBackup(ENTRIES), currentId: "nincs-ilyen" };

    expect(decodeBackup(encodeBackup(broken))).toBeNull();
  });

  it("elutasítja az idegen kulcsot a csomagban", () => {
    const backup = makeBackup(ENTRIES);
    const tainted = {
      ...backup,
      entries: { ...backup.entries, "más-alkalmazás:token": "x" },
    };

    expect(decodeBackup(encodeBackup(tainted))).toBeNull();
  });
});
