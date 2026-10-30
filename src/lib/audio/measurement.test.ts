import { describe, expect, it } from "bun:test";
import { MEASUREMENT_AUDIO, measurementConstraints } from "./measurement";

describe("measurementConstraints", () => {
  it("kikapcsolja a böngésző hangfeldolgozását", () => {
    const audio = measurementConstraints("").audio as MediaTrackConstraints;

    expect(audio.echoCancellation).toBe(false);
    expect(audio.noiseSuppression).toBe(false);
    expect(audio.autoGainControl).toBe(false);
  });

  it("monóban mér, hogy a sztereó csatornák ne felezzék a szintet", () => {
    const audio = measurementConstraints("").audio as MediaTrackConstraints;

    expect(audio.channelCount).toBe(1);
  });

  it("az alapértelmezett bemenetet kéri, ha nincs kiválasztott eszköz", () => {
    const audio = measurementConstraints("").audio as MediaTrackConstraints;

    expect(audio.deviceId).toBeUndefined();
  });

  it("a kiválasztott mikrofont pontosan kéri", () => {
    const audio = measurementConstraints("abc123")
      .audio as MediaTrackConstraints;

    expect(audio.deviceId).toEqual({ exact: "abc123" });
  });

  it("nem módosítja a közös alap-beállítást", () => {
    measurementConstraints("abc123");

    expect(MEASUREMENT_AUDIO.deviceId).toBeUndefined();
    expect(MEASUREMENT_AUDIO.autoGainControl).toBe(false);
  });
});
