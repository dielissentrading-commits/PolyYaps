/**
 * Audio playback — docs/07-technical-architecture.md, section 17.
 *
 * The UI asks for "the audio for this item" and never learns where it came
 * from. Recorded pt-PT assets take priority; device speech synthesis is the
 * fallback so every item is audible before the asset library exists.
 */

export interface AudioProvider {
  readonly name: string;
  /** Whether this provider can speak the given item right now. */
  canPlay(request: AudioRequest): boolean;
  play(request: AudioRequest): Promise<void>;
}

export interface AudioRequest {
  text: string;
  /** Path to a recorded asset, when the content item has one. */
  audioPath?: string;
  /** Slower delivery, for "zeg het na" practice. */
  slow?: boolean;
}

/** Plays a recorded pt-PT asset shipped with the app. */
const assetProvider: AudioProvider = {
  name: 'asset',
  canPlay: (request) => Boolean(request.audioPath),
  play: (request) =>
    new Promise((resolve, reject) => {
      const audio = new Audio(request.audioPath);
      audio.playbackRate = request.slow ? 0.75 : 1;
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error(`Could not play ${request.audioPath}`));
      void audio.play().catch(reject);
    }),
};

/** Falls back to the device voice. Quality varies, availability does not. */
const speechProvider: AudioProvider = {
  name: 'speech-synthesis',
  canPlay: () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  play: (request) =>
    new Promise((resolve) => {
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(request.text);
      utterance.lang = 'pt-PT';
      utterance.rate = request.slow ? 0.7 : 0.95;

      // Prefer a European Portuguese voice over a Brazilian one when present.
      const voice =
        synth.getVoices().find((entry) => entry.lang.replace('_', '-') === 'pt-PT') ??
        synth.getVoices().find((entry) => entry.lang.startsWith('pt'));
      if (voice) utterance.voice = voice;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      synth.speak(utterance);
    }),
};

const providers: AudioProvider[] = [assetProvider, speechProvider];

/** True when at least one provider can produce sound on this device. */
export function canPlayAudio(): boolean {
  return providers.some((provider) => provider.canPlay({ text: 'teste' }));
}

/** Speaks a learning target, using the best provider available. */
export async function playAudio(request: AudioRequest): Promise<void> {
  for (const provider of providers) {
    if (provider.canPlay(request)) {
      try {
        await provider.play(request);
        return;
      } catch {
        // Fall through to the next provider rather than failing the lesson.
      }
    }
  }
}

export function stopAudio(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
