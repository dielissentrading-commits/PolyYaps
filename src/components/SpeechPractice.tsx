import { useState } from 'react';
import { assessSpokenPortuguese, speakPt, speechRecognitionAvailable } from '../lib/speech';

type Props = {
  prompt: string;
  model: string;
  onAssessment?: (score: number) => void;
};

export function SpeechPractice({ prompt, model, onAssessment }: Props) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selfChecked, setSelfChecked] = useState(false);
  const supported = speechRecognitionAvailable();

  async function record() {
    if (listening) return;
    setListening(true);
    setError('');
    try {
      const result = await assessSpokenPortuguese(model);
      setTranscript(result.transcript);
      setScore(result.score);
      onAssessment?.(result.score);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Spraakherkenning mislukt.');
    } finally {
      setListening(false);
    }
  }

  return (
    <div className="speech-practice">
      <div className="speech-prompt"><small>SPREEKOPDRACHT</small><strong>{prompt}</strong></div>
      <button className="secondary-button" onClick={() => speakPt(model)}>🔊 Luister naar voorbeeld</button>

      {supported ? (
        <>
          <button className={`speak-orb-button ${listening ? 'listening' : ''}`} onClick={() => void record()} disabled={listening}>
            <span>🎙</span><small>{listening ? 'Luisteren…' : 'Start microfoon'}</small>
          </button>
          {transcript && <div className="speech-transcript"><small>HERKEND</small><strong>{transcript}</strong></div>}
          {score !== null && (
            <div className={`speech-score ${score >= 75 ? 'good' : score >= 55 ? 'medium' : 'weak'}`}>
              <strong>{score}%</strong>
              <span>{score >= 75 ? 'Goed verstaanbaar' : score >= 55 ? 'Begrijpelijk — probeer nog één keer voor vloeiendheid' : 'Nog lastig — luister en probeer opnieuw'}</span>
            </div>
          )}
          {error && <div className="speech-error">{error}</div>}
        </>
      ) : (
        <div className="speech-fallback">
          <strong>Microfoonbeoordeling niet beschikbaar</strong>
          <span>Zeg de zin hardop na en beoordeel jezelf. De rest van de les blijft volledig werken.</span>
          <button className={`self-check ${selfChecked ? 'checked' : ''}`} onClick={() => { setSelfChecked((value) => !value); if (!selfChecked) onAssessment?.(70); }}>
            <span>{selfChecked ? '✓' : '○'}</span> Ik heb de opdracht hardop gedaan
          </button>
        </div>
      )}
    </div>
  );
}
