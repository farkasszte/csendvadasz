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

export type VolumeGoalPreset =
  "silent" | "independent" | "partner" | "group" | "custom";
export type ArrivalRatePreset =
  "relaxed" | "normal" | "lively" | "deep" | "custom";
/**
 * What Too Loud does to the Creatures already out: hold still until the room
 * settles, or start running away. See docs/adr/0003-animals-can-run-away.md.
 */
export type LoudResponse = "flee" | "pause";

export const VOLUME_GOAL_PRESETS: Record<
  Exclude<VolumeGoalPreset, "custom">,
  { goal: number }
> = {
  silent: { goal: 15 },
  independent: { goal: 30 },
  partner: { goal: 50 },
  // Csoportmunka: a megbeszélés és az együtt dolgozás hangosabb a pármunkánál,
  // és a magyar középiskolai gyakorlatban ez a leggyakoribb „még rendben van”
  // szint. Enélkül a tanár kénytelen a pármunka-sávot feljebb húzni, és akkor
  // elveszíti a két szint közötti különbséget.
  group: { goal: 65 },
};

export const ARRIVAL_RATE_PRESETS: Record<
  Exclude<ArrivalRatePreset, "custom">,
  { minutes: number }
> = {
  relaxed: { minutes: 8 },
  normal: { minutes: 5 },
  lively: { minutes: 2 },
  // Elmélyült munka: 45 perces órán a sűrű érkezés megzavarja a koncentrációt,
  // ezért itt ritkábban jön állat — a csend jutalma a jelenet nyugalma.
  deep: { minutes: 12 },
};

/**
 * Az óra fázisai: egy koppintás beállítja hozzá a hangerő-célt és az érkezési
 * ritmust. A küszöbök tanáronként és termenként mások, ezért mindkettő
 * állítható — a gyári érték csak kiindulás. A „Bevezető" és az „Összegzés"
 * csendes (a tanár beszél), az önálló munka halk, a csoportmunka hangosabb.
 */
export type LessonPhase = "intro" | "independent" | "group" | "wrapUp";

export const LESSON_PHASES: LessonPhase[] = [
  "intro",
  "independent",
  "group",
  "wrapUp",
];

export interface PhaseSetting {
  /** Hangerő-cél, 1–99, ugyanazon a skálán, mint a mérő vonala. */
  goal: number;
  /** Állatok érkezése, egész percben. */
  minutes: number;
}

export const DEFAULT_PHASES: Record<LessonPhase, PhaseSetting> = {
  intro: { goal: VOLUME_GOAL_PRESETS.silent.goal, minutes: 8 },
  independent: { goal: VOLUME_GOAL_PRESETS.independent.goal, minutes: 5 },
  group: { goal: VOLUME_GOAL_PRESETS.group.goal, minutes: 2 },
  wrapUp: { goal: VOLUME_GOAL_PRESETS.silent.goal, minutes: 8 },
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
  /** Órafázisonkénti hangerő-cél és érkezési ritmus. */
  phases: Record<LessonPhase, PhaseSetting>;
}

const DEFAULTS: StoredSettings = {
  scene: DEFAULT_SCENE,
  deviceId: "",
  calibration: null,
  volumeGoalPreset: "independent",
  volumeGoal: VOLUME_GOAL_PRESETS.independent.goal,
  arrivalRatePreset: "normal",
  arrivalMinutes: ARRIVAL_RATE_PRESETS.normal.minutes,
  loudResponse: "pause",
  showMeter: true,
  showCounter: false,
  phases: DEFAULT_PHASES,
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

/** A mentett fázisok, hiányzó vagy hibás mezővel a gyári értékre esve. */
function readPhases(stored: unknown): Record<LessonPhase, PhaseSetting> {
  const saved = (stored ?? {}) as Partial<Record<LessonPhase, PhaseSetting>>;
  const phases = {} as Record<LessonPhase, PhaseSetting>;
  for (const id of LESSON_PHASES) {
    const fallback = DEFAULT_PHASES[id];
    phases[id] = {
      goal: clampGoal(saved[id]?.goal, fallback.goal),
      minutes: clampMinutes(saved[id]?.minutes, fallback.minutes),
    };
  }
  return phases;
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
    // A fázisok később kerültek bele: a régi mentésből hiányzó kulcsok a
    // gyári értéket kapják, a meglévők pedig érvényes tartományba kerülnek.
    stored.phases = readPhases(stored.phases);
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

  useVolumeGoalPreset(preset: Exclude<VolumeGoalPreset, "custom">) {
    this.#stored = {
      ...this.#stored,
      volumeGoalPreset: preset,
      volumeGoal: VOLUME_GOAL_PRESETS[preset].goal,
    };
    this.#save();
  }

  setVolumeGoal(goal: number) {
    const clamped = Math.max(1, Math.min(99, Math.round(goal)));
    const matching = (
      Object.keys(VOLUME_GOAL_PRESETS) as Exclude<VolumeGoalPreset, "custom">[]
    ).find((preset) => VOLUME_GOAL_PRESETS[preset].goal === clamped);
    this.#stored = {
      ...this.#stored,
      volumeGoal: clamped,
      volumeGoalPreset: matching ?? "custom",
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
    const matching = (
      Object.keys(ARRIVAL_RATE_PRESETS) as Exclude<
        ArrivalRatePreset,
        "custom"
      >[]
    ).find((preset) => ARRIVAL_RATE_PRESETS[preset].minutes === clamped);
    this.#stored = {
      ...this.#stored,
      arrivalMinutes: clamped,
      arrivalRatePreset: matching ?? "custom",
    };
    this.#save();
  }

  get phases(): Record<LessonPhase, PhaseSetting> {
    return this.#stored.phases;
  }

  /** Egy fázis küszöbeinek módosítása; a másik érték marad. */
  setPhase(id: LessonPhase, patch: Partial<PhaseSetting>) {
    const current = this.#stored.phases[id];
    const next: PhaseSetting = {
      goal: clampGoal(patch.goal ?? current.goal, current.goal),
      minutes: clampMinutes(patch.minutes ?? current.minutes, current.minutes),
    };
    this.#stored = {
      ...this.#stored,
      phases: { ...this.#stored.phases, [id]: next },
    };
    this.#save();
  }

  /**
   * Egy fázis beállítása az órán: hangerő-cél és érkezési ritmus egyszerre.
   * A preset csak címke: ha a tanár saját küszöböt írt be, az „custom" lesz.
   */
  applyPhase(id: LessonPhase) {
    const phase = this.#stored.phases[id];
    const goal = clampGoal(phase.goal, DEFAULT_PHASES[id].goal);
    const minutes = clampMinutes(phase.minutes, DEFAULT_PHASES[id].minutes);
    const goalPreset =
      (
        Object.keys(VOLUME_GOAL_PRESETS) as Exclude<
          VolumeGoalPreset,
          "custom"
        >[]
      ).find((preset) => VOLUME_GOAL_PRESETS[preset].goal === goal) ?? "custom";
    const ratePreset =
      (
        Object.keys(ARRIVAL_RATE_PRESETS) as Exclude<
          ArrivalRatePreset,
          "custom"
        >[]
      ).find((preset) => ARRIVAL_RATE_PRESETS[preset].minutes === minutes) ??
      "custom";
    this.#stored = {
      ...this.#stored,
      volumeGoal: goal,
      volumeGoalPreset: goalPreset,
      arrivalMinutes: minutes,
      arrivalRatePreset: ratePreset,
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
