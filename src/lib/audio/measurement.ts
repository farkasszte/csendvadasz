/**
 * Mit kérünk a böngészőtől, amikor a termet hallgatjuk.
 *
 * A böngésző saját hangfeldolgozása telefonbeszélgetésre és hangasszisztensekre
 * készült, és szembe megy a hangerő-méréssel:
 *
 * - az automatikus erősítés (AGC) a hangos termet visszahúzza kényelmes
 *   szintre, tehát a mérő épp akkor mutat kevesebbet, amikor igazán hangos —
 *   a sáv így megengedő lesz, a tanár pedig nem érti, miért nem jelez semmit;
 * - a zajszűrés a halk háttérzúgást (szellőzés, projektor ventilátora)
 *   kinullázza, tehát a zügó terem „csendnek” látszik;
 * - a visszhangszűrés a hangszóró hangjától függően változtatja a szintet, így
 *   ugyanaz az osztály két különböző értéket kap.
 *
 * Mindhármat kikapcsolva a mutatott szám azt jelenti, amit a tanár lát benne.
 */

export const MEASUREMENT_AUDIO: MediaTrackConstraints = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  channelCount: 1,
};

/**
 * A getUserMedia kérése egy adott mikrofonra, mérésre szabott feldolgozással.
 * Üres `deviceId` esetén az alapértelmezett bemenet.
 */
export function measurementConstraints(
  deviceId: string,
): MediaStreamConstraints {
  const audio: MediaTrackConstraints = deviceId
    ? { ...MEASUREMENT_AUDIO, deviceId: { exact: deviceId } }
    : { ...MEASUREMENT_AUDIO };

  return { audio };
}
