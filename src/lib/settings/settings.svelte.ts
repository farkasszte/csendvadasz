// Csendvadász: a magyar változat módosítása (lásd NOTICE.md)
/**
 * Everything the teacher chooses, remembered on this computer.
 *
 * Per the workspace AGENTS.md data hierarchy this is localStorage and nothing
 * more: no accounts, no backend, nothing leaves the device. The animals each
 * Scene has earned are kept separately (`session/savedReef.ts`) and only
 * until Reset.
 */

import { browser } from "$app/environment";
import type { Calibration } from "$lib/audio/calibration";
import { DEFAULT_SCENE, SCENE_IDS, type SceneId } from "$lib/scenes/types";

/**
 * A munkajelleg-kártyák. Mindegyik a saját hangerő-célját és érkezési
 * ritmusát tartja, és a tanár a mostani beállításait egy kártyára mentheti:
 * így egy teremhez és egy osztályhoz egyszer kell beállítani, utána elég egy
 * koppintás. A gyári érték csak kiindulás.
 */
export type WorkType = "silent" | "independent" | "partner" | "group";

export const WORK_TYPES: WorkType[] = [
  "silent",
  "independent",
  "partner",
  "group",
];

export type VolumeGoalPreset = WorkType | "custom";
export type ArrivalRatePreset = "relaxed" | "normal" | "lively" | "custom";
/**
 * What Too Loud does to the Creatures already out: hold still until the room
 * settles, or start running away. See docs/adr/0003-animals-can-run-away.md.
 */
export type LoudResponse = "flee" | "pause";

export interface WorkTypeSetting {
  /** Hangerő-cél, 1–99, ugyanazon a skálán, mint a mérő vonala. */
  goal: number;
  /** Állatok érkezése, egész percben. */
  minutes: number;
}

export const DEFAULT_WORK_TYPES: Record<WorkType, WorkTypeSetting> = {
  silent: { goal: 15, minutes: 8 },
  independent: { goal: 30, minutes: 5 },
  partner: { goal: 50, minutes: 2 },
  // Csoportmunka: a megbeszélés és az együtt dolgozás hangosabb a pármunkánál,
  // és a magyar középiskolai gyakorlatban ez a leggyakoribb „még rendben van”
  // szint. Enélkül a tanár kénytelen a pármunka-sávot feljebb húzni, és akkor
  // elveszíti a két szint közötti különbséget.
  group: { goal: 65, minutes: 2 },
};

export const ARRIVAL_RATE_PRESETS: Record<
  Exclude<ArrivalRatePreset, "custom">,
  { minutes: number }
> = {
  relaxed: { minutes: 8 },
  normal: { minutes: 5 },
  lively: { minutes: 2 },
};

/** Bounds on a typed-in Arrival Rate, in whole minutes. */
export const MIN_ARRIVAL_MINUTES = 1;
export const MAX_ARRIVAL_MINUTES = 60;

const STORAGE_KEY = "class-noise-level:settings";

interface StoredSettings {
  scene: SceneId;
  deviceId: string;
  calibration: Calibration | null;
  volumeGoalPreset: VolumeGoalPreset;
  volumeGoal: number;
  arrivalRatePreset: ArrivalRatePreset;
  arrivalMinutes: number;
  loudResponse: LoudResponse;
  /** Keep the Noise Meter up over the Scene, not just in Settings. */
  showMeter: boolean;
  /** Keep a count of the Creatures that have arrived up over the Scene. */
  showCounter: boolean;
  /** A munkajelleg-kártyákra mentett cél és ritmus. */
  workTypes: Record<WorkType, WorkTypeSetting>;
}

const DEFAULTS: StoredSettings = {
  scene: DEFAULT_SCENE,
  deviceId: "",
  calibration: null,
  volumeGoalPreset: "independent",
  volumeGoal: DEFAULT_WORK_TYPES.independent.goal,
  arrivalRatePreset: "normal",
  arrivalMinutes: DEFAULT_WORK_TYPES.independent.minutes,
  loudResponse: "pause",
  showMeter: false,
  showCounter: false,
  workTypes: DEFAULT_WORK_TYPES,
};

function clampGoal(goal: unknown, fallback: number) {
  const value = Number(goal);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(99, Math.round(value)));
}

function clampMinutes(minutes: unknown, fallback: number) {
  const value = Number(minutes);
  if (!Number.isFinite(value)) return fallback;
  return Math.max(
    MIN_ARRIVAL_MINUTES,
    Math.min(MAX_ARRIVAL_MINUTES, Math.round(value)),
  );
}

/** A percértékhez tartozó ritmus-preset, ha van ilyen. */
function ratePresetFor(minutes: number): ArrivalRatePreset {
  return (
    (
      Object.keys(ARRIVAL_RATE_PRESETS) as Exclude<
        ArrivalRatePreset,
        "custom"
      >[]
    ).find((preset) => ARRIVAL_RATE_PRESETS[preset].minutes === minutes) ??
    "custom"
  );
}

/** A mentett kártyák, hiányzó vagy hibás mezővel a gyári értékre esve. */
function readWorkTypes(stored: unknown): Record<WorkType, WorkTypeSetting> {
  const saved = (stored ?? {}) as Partial<Record<WorkType, WorkTypeSetting>>;
  const workTypes = {} as Record<WorkType, WorkTypeSetting>;
  for (const id of WORK_TYPES) {
    const fallback = DEFAULT_WORK_TYPES[id];
    workTypes[id] = {
      goal: clampGoal(saved[id]?.goal, fallback.goal),
      minutes: clampMinutes(saved[id]?.minutes, fallback.minutes),
    };
  }
  return workTypes;
}

function read(): StoredSettings {
  if (!browser) return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const stored = JSON.parse(raw) as Partial<StoredSettings>;
    // Settings saved before the rate could be typed in only have the preset;
    // carry its minutes over rather than resetting the teacher to Normal.
    if (stored.arrivalMinutes === undefined && stored.arrivalRatePreset) {
      stored.arrivalMinutes =
        stored.arrivalRatePreset === "custom"
          ? DEFAULTS.arrivalMinutes
          : ARRIVAL_RATE_PRESETS[stored.arrivalRatePreset]?.minutes;
    }
    // A kártyák később kerültek bele: a régi mentésből hiányzó kulcsok a
    // gyári értéket kapják, a meglévők pedig érvényes tartományba kerülnek.
    stored.workTypes = readWorkTypes(stored.workTypes);
    // A Scene this version no longer has falls back to the default.
    if (stored.scene && !SCENE_IDS.includes(stored.scene)) delete stored.scene;
    return { ...DEFAULTS, ...stored };
  } catch {
    return { ...DEFAULTS };
  }
}

class Settings {
  #stored = $state<StoredSettings>(read());

  #save() {
    if (!browser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#stored));
    } catch {
      // A teacher browsing privately still gets a working app, just a
      // forgetful one. Losing settings is not worth breaking the Session for.
    }
  }

  get scene() {
    return this.#stored.scene;
  }

  set scene(value: SceneId) {
    this.#stored = { ...this.#stored, scene: value };
    this.#save();
  }

  get deviceId() {
    return this.#stored.deviceId;
  }

  set deviceId(value: string) {
    if (value === this.#stored.deviceId) return;
    // A calibration belongs to the microphone it was measured on, so
    // switching device throws it away rather than silently misreading.
    this.#stored = { ...this.#stored, deviceId: value, calibration: null };
    this.#save();
  }

  get calibration() {
    return this.#stored.calibration;
  }

  set calibration(value: Calibration | null) {
    this.#stored = { ...this.#stored, calibration: value };
    this.#save();
  }

  get volumeGoal() {
    return this.#stored.volumeGoal;
  }

  get volumeGoalPreset() {
    return this.#stored.volumeGoalPreset;
  }

  get workTypes(): Record<WorkType, WorkTypeSetting> {
    return this.#stored.workTypes;
  }

  /** Egy kártya kiválasztása: a rá mentett cél és ritmus lép életbe. */
  useWorkType(id: WorkType) {
    const slot = this.#stored.workTypes[id];
    const minutes = clampMinutes(slot.minutes, DEFAULT_WORK_TYPES[id].minutes);
    this.#stored = {
      ...this.#stored,
      volumeGoalPreset: id,
      volumeGoal: clampGoal(slot.goal, DEFAULT_WORK_TYPES[id].goal),
      arrivalMinutes: minutes,
      arrivalRatePreset: ratePresetFor(minutes),
    };
    this.#save();
  }

  /**
   * A mostani cél és ritmus rámentése a kártyára — a felület csak megerősítés
   * után hívja. A kiválasztás a kártyán marad, hogy látszódjon, mit mentett.
   */
  saveWorkType(id: WorkType) {
    this.#stored = {
      ...this.#stored,
      volumeGoalPreset: id,
      workTypes: {
        ...this.#stored.workTypes,
        [id]: {
          goal: this.#stored.volumeGoal,
          minutes: this.#stored.arrivalMinutes,
        },
      },
    };
    this.#save();
  }

  /**
   * A vonal húzása nem veszi le a kiválasztást a kártyáról: a tanár épp azt
   * hangolja, és a „Mentés" gomb arra írja rá az új értéket.
   */
  setVolumeGoal(goal: number) {
    this.#stored = {
      ...this.#stored,
      volumeGoal: Math.max(1, Math.min(99, Math.round(goal))),
    };
    this.#save();
  }

  get arrivalRatePreset() {
    return this.#stored.arrivalRatePreset;
  }

  get arrivalMinutes() {
    return this.#stored.arrivalMinutes;
  }

  useArrivalRatePreset(preset: Exclude<ArrivalRatePreset, "custom">) {
    this.#stored = {
      ...this.#stored,
      arrivalRatePreset: preset,
      arrivalMinutes: ARRIVAL_RATE_PRESETS[preset].minutes,
    };
    this.#save();
  }

  setArrivalMinutes(minutes: number) {
    if (!Number.isFinite(minutes)) return;
    const clamped = Math.max(
      MIN_ARRIVAL_MINUTES,
      Math.min(MAX_ARRIVAL_MINUTES, Math.round(minutes)),
    );
    this.#stored = {
      ...this.#stored,
      arrivalMinutes: clamped,
      arrivalRatePreset: ratePresetFor(clamped),
    };
    this.#save();
  }

  get loudResponse() {
    return this.#stored.loudResponse;
  }

  set loudResponse(value: LoudResponse) {
    this.#stored = { ...this.#stored, loudResponse: value };
    this.#save();
  }

  get showMeter() {
    return this.#stored.showMeter;
  }

  set showMeter(value: boolean) {
    this.#stored = { ...this.#stored, showMeter: value };
    this.#save();
  }

  get showCounter() {
    return this.#stored.showCounter;
  }

  set showCounter(value: boolean) {
    this.#stored = { ...this.#stored, showCounter: value };
    this.#save();
  }

  get arrivalIntervalMs() {
    return this.#stored.arrivalMinutes * 60_000;
  }
}

export const settings = new Settings();
