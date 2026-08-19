/**
 * Microphone recording for speaking practice.
 *
 * Recordings stay on the device and are dropped when the session ends, which
 * is the privacy default from architecture section 25.
 */

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'denied' | 'unsupported';

export interface Recording {
  blob: Blob;
  /** Object URL for playback; revoke it when the recording is discarded. */
  url: string;
  durationMs: number;
}

export function isRecordingSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof MediaRecorder !== 'undefined'
  );
}

/** Picks a container the browser can actually record. */
function pickMimeType(): string | undefined {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg'];
  return candidates.find((type) => MediaRecorder.isTypeSupported?.(type));
}

export class Recorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startedAt = 0;

  async start(): Promise<void> {
    if (!isRecordingSupported()) {
      throw new Error('unsupported');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = pickMimeType();
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.chunks = [];
    this.startedAt = Date.now();

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    this.recorder.start();
  }

  stop(): Promise<Recording> {
    return new Promise((resolve, reject) => {
      const recorder = this.recorder;
      if (!recorder) {
        reject(new Error('not recording'));
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: recorder.mimeType || 'audio/webm' });
        this.release();
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          durationMs: Date.now() - this.startedAt,
        });
      };

      recorder.stop();
    });
  }

  /** Stops without producing a recording, e.g. when leaving the screen. */
  cancel(): void {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.onstop = null;
      this.recorder.stop();
    }
    this.release();
  }

  private release(): void {
    // Releasing the tracks turns off the browser's recording indicator.
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.recorder = null;
  }
}
