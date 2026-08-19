import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { playAudio } from '@/audio/playback';
import { Recorder, isRecordingSupported, type Recording } from '@/audio/recorder';
import { getSpeechService } from '@/audio/speechAdapter';
import './speaking.css';

interface SpeakingPracticeProps {
  /** What the learner should say, in Portuguese. */
  target: string;
  /** The Dutch meaning, shown as the cue. */
  hint?: string;
  /** Reports whether the attempt counted, for mastery. */
  onAssess: (accepted: boolean) => void;
}

type Phase = 'ready' | 'recording' | 'review' | 'blocked';

/**
 * Speaking practice — architecture section 18, V1 level: record, compare with
 * the target, judge it yourself. No audio leaves the device.
 */
export function SpeakingPractice({ target, hint, onAssess }: SpeakingPracticeProps) {
  const [phase, setPhase] = useState<Phase>(isRecordingSupported() ? 'ready' : 'blocked');
  const [recording, setRecording] = useState<Recording | null>(null);
  const [message, setMessage] = useState<string | undefined>();
  const recorder = useRef(new Recorder());

  // Leaving mid-recording must release the microphone and the object URL.
  useEffect(() => {
    const active = recorder.current;
    return () => {
      active.cancel();
      setRecording((previous) => {
        if (previous) URL.revokeObjectURL(previous.url);
        return null;
      });
    };
  }, []);

  const start = async () => {
    try {
      await recorder.current.start();
      setPhase('recording');
    } catch {
      setPhase('blocked');
    }
  };

  const stop = async () => {
    const result = await recorder.current.stop();
    setRecording(result);
    setPhase('review');
  };

  const assess = async (matched: boolean) => {
    const feedback = await getSpeechService().evaluate(
      { recording: recording!, target },
      matched,
    );
    setMessage(feedback.message);
    onAssess(feedback.accepted);
  };

  const retry = () => {
    if (recording) URL.revokeObjectURL(recording.url);
    setRecording(null);
    setMessage(undefined);
    setPhase('ready');
  };

  return (
    <div className="speaking">
      <p className="speaking__label muted small">Zeg dit hardop</p>
      <p className="speaking__target" lang="pt-PT">
        {target}
      </p>
      {hint && <p className="speaking__hint muted">{hint}</p>}

      <button
        type="button"
        className="speaking__listen"
        onClick={() => void playAudio({ text: target, slow: true })}
      >
        <Icon name="sound" size={18} />
        <span>Voorbeeld</span>
      </button>

      {phase === 'blocked' ? (
        <p className="speaking__blocked muted small">
          Opnemen kan niet in deze browser of de microfoon is geweigerd. Zeg de zin hardop en ga
          verder.
        </p>
      ) : (
        <div className="speaking__controls">
          {phase !== 'review' && (
            <button
              type="button"
              className={
                phase === 'recording' ? 'mic-button mic-button--on' : 'mic-button'
              }
              onClick={() => (phase === 'recording' ? void stop() : void start())}
              aria-pressed={phase === 'recording'}
            >
              <Icon name="mic" size={28} />
              <span className="visually-hidden">
                {phase === 'recording' ? 'Stop met opnemen' : 'Begin met opnemen'}
              </span>
            </button>
          )}

          <p className="speaking__state small muted">
            {phase === 'recording' ? 'Opnemen… tik om te stoppen' : ''}
            {phase === 'ready' ? 'Tik op de microfoon' : ''}
          </p>

          {phase === 'review' && recording && (
            <div className="speaking__review">
              <audio className="speaking__player" src={recording.url} controls />
              <p className="speaking__question small">Klonk het als het voorbeeld?</p>
              <div className="speaking__actions">
                <button type="button" className="speaking__action" onClick={() => void assess(true)}>
                  Ja, dat lijkt erop
                </button>
                <button type="button" className="speaking__action" onClick={retry}>
                  Nog een keer
                </button>
              </div>
              {message && <p className="speaking__message small muted">{message}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
