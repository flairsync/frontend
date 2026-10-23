let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  return audioContext;
}

// Browsers refuse to run an AudioContext until a user gesture. A KDS screen
// gets tapped constantly (bump/recall/settings), so resume it on the first
// tap rather than needing a dedicated "enable sound" button no one would press.
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    () => {
      getAudioContext()?.resume().catch(() => {});
    },
    { once: true, passive: true },
  );
}

// A short two-note chime, synthesized rather than shipped as an audio file —
// nothing to load or license, and pitched to cut through kitchen noise
// (ticket printers, extraction fans) without being jarring.
export function playNewOrderChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  // Harmless no-op if already running; if this is the very first tick before
  // any tap, it stays suspended and simply won't be audible yet.
  ctx.resume().catch(() => {});

  const now = ctx.currentTime;
  const notes: Array<[frequency: number, start: number]> = [
    [880, now],         // A5
    [1174.66, now + 0.14], // D6
  ];
  const noteDuration = 0.16;

  for (const [frequency, start] of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDuration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + noteDuration + 0.02);
  }
}
