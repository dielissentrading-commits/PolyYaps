import { useMemo, useState } from 'react';
import type { ChallengeContent, ChallengeStep, ItemDescriptor } from '../types/learning';
import { completeChallenge, type ProgressState } from '../lib/progress';
import { descriptorFromItem, ensureItems, recordAttempt } from '../lib/learningDb';
import { assessSpokenPortuguese, normalizePortuguese, speakPt, speechRecognitionAvailable } from '../lib/speech';

type Props = {
  challenge: ChallengeContent;
  achievementId: string;
  onClose: () => void;
  onComplete: (progress: ProgressState) => void;
  onMasteryChanged?: () => void;
};

type Phase = 'intro' | 'toolkit' | 'scenario' | 'result';
type Feedback = 'correct' | 'wrong' | null;

function descriptorList(challenge: ChallengeContent): ItemDescriptor[] {
  return [
    ...challenge.toolkit.vocabulary.map((item) => descriptorFromItem(challenge.day, 'word', item)),
    ...challenge.toolkit.chunks.map((item) => descriptorFromItem(challenge.day, 'chunk', item)),
  ];
}

function descriptorForStep(step: ChallengeStep, descriptors: ItemDescriptor[]) {
  if (!step.itemRef) return undefined;
  return descriptors.find((item) => item.itemType === step.itemRef?.type && item.itemId === step.itemRef?.id);
}

export function ScenarioChallengeOverlay({ challenge, achievementId, onClose, onComplete, onMasteryChanged }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finalProgress, setFinalProgress] = useState<ProgressState | null>(null);
  const [micBusy, setMicBusy] = useState(false);
  const [micScore, setMicScore] = useState<number | null>(null);
  const currentStep = challenge.steps[stepIndex];
  const descriptors = useMemo(() => descriptorList(challenge), [challenge]);
  const score = useMemo(() => Math.round((correctCount / challenge.steps.length) * 100), [correctCount, challenge.steps.length]);
  const passed = score >= 70;
  const stars = score >= 90 ? 3 : score >= 75 ? 2 : 1;

  async function startScenario() {
    try {
      await ensureItems(descriptors);
      for (const item of descriptors) await recordAttempt(item, 'exposure', true);
      onMasteryChanged?.();
    } catch {
      // Offline lesson remains usable if IndexedDB is unavailable.
    }
    setPhase('scenario');
  }

  async function useMicrophone() {
    if (micBusy || currentStep.type !== 'input') return;
    setMicBusy(true);
    setMicScore(null);
    try {
      const result = await assessSpokenPortuguese(currentStep.answer);
      setAnswer(result.transcript);
      setMicScore(result.score);
    } catch {
      setMicScore(0);
    } finally {
      setMicBusy(false);
    }
  }

  async function submit(choice?: string) {
    if (feedback) return;
    const submitted = choice ?? answer;
    const accepted = [currentStep.answer, ...(currentStep.alternatives ?? [])].map(normalizePortuguese);
    const correct = accepted.includes(normalizePortuguese(submitted));
    setFeedback(correct ? 'correct' : 'wrong');
    if (choice) setAnswer(choice);

    const descriptor = descriptorForStep(currentStep, descriptors);
    if (descriptor) {
      try {
        const evidence = currentStep.speaker === 'barista' && currentStep.line ? 'listening' : currentStep.type === 'input' ? 'context' : 'recognition';
        await recordAttempt(descriptor, evidence, correct);
        onMasteryChanged?.();
      } catch {
        // Challenge scoring is independent of local mastery storage.
      }
    }
  }

  function continueScenario() {
    const nextCorrect = correctCount + (feedback === 'correct' ? 1 : 0);
    if (stepIndex < challenge.steps.length - 1) {
      setCorrectCount(nextCorrect);
      setStepIndex((value) => value + 1);
      setAnswer('');
      setFeedback(null);
      setMicScore(null);
      return;
    }

    const finalScore = Math.round((nextCorrect / challenge.steps.length) * 100);
    const progress = completeChallenge(
      challenge.day,
      finalScore,
      challenge.rewardXp,
      challenge.stampId,
      challenge.toolkit.vocabulary.map((item) => item.id),
      challenge.toolkit.chunks.map((item) => item.id),
      achievementId,
    );
    setCorrectCount(nextCorrect);
    setFinalProgress(progress);
    setPhase('result');
    onComplete(progress);
  }

  return (
    <section className="focus-shell challenge-shell" aria-label={`${challenge.title} Dag ${challenge.day}`}>
      <header className="focus-header">
        <button className="icon-button" onClick={onClose} aria-label="Challenge sluiten">×</button>
        <span>Dag {challenge.day} · Challenge</span>
        <span className="focus-count">{phase === 'scenario' ? `${stepIndex + 1}/${challenge.steps.length}` : challenge.city}</span>
      </header>
      <div className="focus-progress"><span style={{ width: phase === 'intro' ? '8%' : phase === 'toolkit' ? '20%' : phase === 'scenario' ? `${20 + ((stepIndex + 1) / challenge.steps.length) * 70}%` : '100%' }} /></div>

      {phase === 'intro' && (
        <main className="lesson-stage challenge-intro">
          <div className="challenge-badge">{challenge.day === 30 ? '🇵🇹' : challenge.day === 25 ? '🍷' : challenge.day === 20 ? '⏳' : challenge.day === 15 ? '🧳' : '🗺️'}</div>
          <div className="eyebrow">CHECKPOINT · {challenge.city.toUpperCase()}</div>
          <h1>{challenge.title}</h1>
          <p className="lead">{challenge.subtitle}</p>
          <div className="challenge-reward-card"><small>BELONING BIJ 70%+</small><strong>+{challenge.rewardXp} XP</strong><span>{challenge.stampLabel} · paspoortstempel</span></div>
          <button className="primary-button" onClick={() => setPhase('toolkit')}>Bekijk toolkit</button>
        </main>
      )}

      {phase === 'toolkit' && (
        <main className="lesson-stage toolkit-stage">
          <div className="eyebrow">VOORBEREIDING</div>
          <h1>{challenge.goal}</h1>
          <p className="lead">Bekijk de belangrijkste woorden en zinnen één keer. Daarna volgt het scenario zonder extra uitleg.</p>
          {challenge.toolkit.numberLines.length > 0 && <div className="number-sheet">{challenge.toolkit.numberLines.map((line) => <p key={line}>{line}</p>)}</div>}
          <div className="toolkit-chunks">
            {challenge.toolkit.chunks.map((chunk) => (
              <button key={chunk.id} onClick={() => speakPt(chunk.portuguese)}><span><strong>{chunk.portuguese}</strong><small>{chunk.dutch}</small></span><b>🔊</b></button>
            ))}
          </div>
          <button className="primary-button" onClick={() => void startScenario()}>Start challenge</button>
        </main>
      )}

      {phase === 'scenario' && (
        <main className="lesson-stage challenge-scenario">
          <div className="stage-meta"><span>{challenge.city.toUpperCase()}</span><strong>{stepIndex + 1} / {challenge.steps.length}</strong></div>
          <div className="micro-progress"><span style={{ width: `${((stepIndex + 1) / challenge.steps.length) * 100}%` }} /></div>

          {currentStep.line && (
            <div className="barista-bubble">
              <div className="barista-avatar">💬</div>
              <div><small>PORTUGUÊS</small><strong>{currentStep.line}</strong></div>
              <button onClick={() => speakPt(currentStep.line ?? '')} aria-label="Luister">🔊</button>
            </div>
          )}

          <div className="challenge-question">
            <small>JOUW OPDRACHT</small>
            <h2>{currentStep.prompt}</h2>
            {currentStep.type === 'input' ? (
              <>
                <input autoCapitalize="none" autoComplete="off" value={answer} disabled={Boolean(feedback)} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && answer.trim() && !feedback) void submit(); }} placeholder="Antwoord in het Portugees..." />
                {!feedback && speechRecognitionAvailable() && <button className="secondary-button" disabled={micBusy} onClick={() => void useMicrophone()}>🎙 {micBusy ? 'Luisteren…' : 'Spreek antwoord'}</button>}
                {micScore !== null && <small className="mic-mini-score">Microfoonmatch: {micScore}%</small>}
                {!feedback && <button className="primary-button" disabled={!answer.trim()} onClick={() => void submit()}>Antwoorden</button>}
              </>
            ) : (
              <div className="choice-list">{currentStep.options?.map((option) => <button key={option} className={feedback && option === currentStep.answer ? 'correct-choice' : feedback && option === answer ? 'wrong-choice' : ''} disabled={Boolean(feedback)} onClick={() => void submit(option)}>{option}</button>)}</div>
            )}
          </div>

          {feedback && <div className={`quiz-feedback ${feedback}`}><strong>{feedback === 'correct' ? '✓ Boa!' : 'Nog niet helemaal'}</strong>{feedback === 'wrong' && <span>Een goed antwoord is: <b>{currentStep.answer}</b></span>}<button className="primary-button" onClick={continueScenario}>{stepIndex === challenge.steps.length - 1 ? 'Bekijk resultaat' : 'Verder'}</button></div>}
        </main>
      )}

      {phase === 'result' && finalProgress && (
        <main className="lesson-stage result-stage challenge-result">
          <div className={`result-mark ${passed ? '' : 'challenge-fail'}`}>{passed ? '✓' : '↻'}</div>
          <div className="eyebrow">{passed ? 'CHALLENGE COMPLETE' : 'NOG ÉÉN RONDE'}</div>
          <h1>{score}%</h1>
          <div className="result-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <p>{passed ? `${challenge.stampLabel} is toegevoegd aan je paspoort.` : 'Vanaf 70% verdien je de stempel. De lastige onderdelen komen ook terug in Smart Review.'}</p>
          <div className="result-grid"><div><strong>+{finalProgress.dayResults[challenge.day]?.xpEarned ?? 0}</strong><span>XP</span></div><div><strong>{finalProgress.streak}</strong><span>streak</span></div><div><strong>{finalProgress.passportStamps.length}</strong><span>stempels</span></div></div>
          <button className="primary-button" onClick={onClose}>Naar Home</button>
        </main>
      )}
    </section>
  );
}
