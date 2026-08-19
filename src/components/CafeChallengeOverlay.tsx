import { useMemo, useState } from 'react';
import { day5Challenge } from '../data/day5Challenge';
import { completeChallenge, type ProgressState } from '../lib/progress';
import { descriptorFromItem, ensureItems, recordAttempt } from '../lib/learningDb';
import type { ChallengeStep, ItemDescriptor } from '../types/learning';

type Props = {
  onClose: () => void;
  onComplete: (progress: ProgressState) => void;
  onMasteryChanged?: () => void;
};

type Phase = 'intro' | 'toolkit' | 'scenario' | 'result';

type Feedback = 'correct' | 'wrong' | null;

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-PT';
  utterance.rate = 0.82;
  window.speechSynthesis.speak(utterance);
}

function normalize(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-PT')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ');
}

const toolkitDescriptors: ItemDescriptor[] = [
  ...day5Challenge.toolkit.vocabulary.map((item) => descriptorFromItem(5, 'word', item)),
  ...day5Challenge.toolkit.chunks.map((item) => descriptorFromItem(5, 'chunk', item)),
];

function descriptorForStep(step: ChallengeStep) {
  if (!step.itemRef) return undefined;
  return toolkitDescriptors.find((item) => item.itemType === step.itemRef?.type && item.itemId === step.itemRef?.id);
}

export function CafeChallengeOverlay({ onClose, onComplete, onMasteryChanged }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finalProgress, setFinalProgress] = useState<ProgressState | null>(null);
  const currentStep = day5Challenge.steps[stepIndex];

  const score = useMemo(() => Math.round((correctCount / day5Challenge.steps.length) * 100), [correctCount]);
  const passed = score >= 70;
  const stars = score >= 90 ? 3 : score >= 75 ? 2 : 1;

  async function startScenario() {
    try {
      await ensureItems(toolkitDescriptors);
      await Promise.all(toolkitDescriptors.map((item) => recordAttempt(item, 'exposure', true)));
      onMasteryChanged?.();
    } catch {
      // Challenge remains usable if IndexedDB is unavailable.
    }
    setPhase('scenario');
  }

  async function submit(choice?: string) {
    if (feedback) return;
    const submitted = choice ?? answer;
    const accepted = [currentStep.answer, ...(currentStep.alternatives ?? [])].map(normalize);
    const correct = accepted.includes(normalize(submitted));
    setFeedback(correct ? 'correct' : 'wrong');
    if (choice) setAnswer(choice);

    const descriptor = descriptorForStep(currentStep);
    if (descriptor) {
      try {
        const evidence = currentStep.speaker === 'barista' && currentStep.line ? 'listening' : 'context';
        await recordAttempt(descriptor, evidence, correct);
        onMasteryChanged?.();
      } catch {
        // Scoring is independent of storage availability.
      }
    }
  }

  function continueScenario() {
    const nextCorrect = correctCount + (feedback === 'correct' ? 1 : 0);
    if (stepIndex < day5Challenge.steps.length - 1) {
      setCorrectCount(nextCorrect);
      setStepIndex((value) => value + 1);
      setAnswer('');
      setFeedback(null);
      return;
    }

    const finalScore = Math.round((nextCorrect / day5Challenge.steps.length) * 100);
    const progress = completeChallenge(
      day5Challenge.day,
      finalScore,
      day5Challenge.rewardXp,
      day5Challenge.stampId,
      day5Challenge.toolkit.vocabulary.map((item) => item.id),
      day5Challenge.toolkit.chunks.map((item) => item.id),
    );
    setCorrectCount(nextCorrect);
    setFinalProgress(progress);
    setPhase('result');
    onComplete(progress);
  }

  return (
    <section className="focus-shell challenge-shell" aria-label="Café Challenge Dag 5">
      <header className="focus-header">
        <button className="icon-button" onClick={onClose} aria-label="Challenge sluiten">×</button>
        <span>Dag 5 · Café Challenge</span>
        <span className="focus-count">{phase === 'scenario' ? `${stepIndex + 1}/${day5Challenge.steps.length}` : 'Lisboa'}</span>
      </header>
      <div className="focus-progress"><span style={{ width: phase === 'intro' ? '8%' : phase === 'toolkit' ? '20%' : phase === 'scenario' ? `${20 + ((stepIndex + 1) / day5Challenge.steps.length) * 70}%` : '100%' }} /></div>

      {phase === 'intro' && (
        <main className="lesson-stage challenge-intro">
          <div className="challenge-badge">☕</div>
          <div className="eyebrow">CHECKPOINT · {day5Challenge.city.toUpperCase()}</div>
          <h1>{day5Challenge.title}</h1>
          <p className="lead">{day5Challenge.subtitle}</p>
          <div className="challenge-reward-card">
            <small>BELONING BIJ 70%+</small>
            <strong>+{day5Challenge.rewardXp} XP</strong>
            <span>{day5Challenge.stampLabel} · paspoortstempel</span>
          </div>
          <button className="primary-button" onClick={() => setPhase('toolkit')}>Bekijk je toolkit</button>
        </main>
      )}

      {phase === 'toolkit' && (
        <main className="lesson-stage toolkit-stage">
          <div className="eyebrow">SNELLE TOOLKIT</div>
          <h1>Getallen, geld & tijd</h1>
          <p className="lead">Je hoeft dit nog niet perfect te kennen. Bekijk het één keer en gebruik het daarna in het scenario.</p>
          <div className="number-sheet">
            {day5Challenge.toolkit.numberLines.map((line) => <p key={line}>{line}</p>)}
          </div>
          <div className="toolkit-chunks">
            {day5Challenge.toolkit.chunks.slice(0, 6).map((chunk) => (
              <button key={chunk.id} onClick={() => speak(chunk.portuguese)}>
                <span><strong>{chunk.portuguese}</strong><small>{chunk.dutch}</small></span><b>🔊</b>
              </button>
            ))}
          </div>
          <button className="primary-button" onClick={() => void startScenario()}>Start cafébezoek</button>
        </main>
      )}

      {phase === 'scenario' && (
        <main className="lesson-stage challenge-scenario">
          <div className="stage-meta"><span>CAFÉ IN LISBOA</span><strong>{stepIndex + 1} / {day5Challenge.steps.length}</strong></div>
          <div className="micro-progress"><span style={{ width: `${((stepIndex + 1) / day5Challenge.steps.length) * 100}%` }} /></div>

          {currentStep.line && (
            <div className="barista-bubble">
              <div className="barista-avatar">☕</div>
              <div><small>EMPREGADO</small><strong>{currentStep.line}</strong></div>
              <button onClick={() => speak(currentStep.line ?? '')} aria-label="Luister naar medewerker">🔊</button>
            </div>
          )}

          <div className="challenge-question">
            <small>JOUW OPDRACHT</small>
            <h2>{currentStep.prompt}</h2>
            {currentStep.type === 'input' ? (
              <>
                <input
                  autoCapitalize="none"
                  autoComplete="off"
                  value={answer}
                  disabled={Boolean(feedback)}
                  onChange={(event) => setAnswer(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter' && answer.trim() && !feedback) void submit(); }}
                  placeholder="Antwoord in het Portugees..."
                />
                {!feedback && <button className="primary-button" disabled={!answer.trim()} onClick={() => void submit()}>Antwoorden</button>}
              </>
            ) : (
              <div className="choice-list">
                {currentStep.options?.map((option) => (
                  <button
                    key={option}
                    className={feedback && option === currentStep.answer ? 'correct-choice' : feedback && option === answer ? 'wrong-choice' : ''}
                    disabled={Boolean(feedback)}
                    onClick={() => void submit(option)}
                  >{option}</button>
                ))}
              </div>
            )}
          </div>

          {feedback && (
            <div className={`quiz-feedback ${feedback}`}>
              <strong>{feedback === 'correct' ? '✓ Boa!' : 'Nog niet helemaal'}</strong>
              {feedback === 'wrong' && <span>Een goed antwoord is: <b>{currentStep.answer}</b></span>}
              <button className="primary-button" onClick={continueScenario}>{stepIndex === day5Challenge.steps.length - 1 ? 'Bekijk challenge-resultaat' : 'Verder'}</button>
            </div>
          )}
        </main>
      )}

      {phase === 'result' && finalProgress && (
        <main className="lesson-stage result-stage challenge-result">
          <div className={`result-mark ${passed ? '' : 'challenge-fail'}`}>{passed ? '✓' : '↻'}</div>
          <div className="eyebrow">{passed ? 'CHALLENGE COMPLETE' : 'BIJNA — NOG ÉÉN RONDE'}</div>
          <h1>{score}%</h1>
          <div className="result-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <p>{passed ? 'Je hebt je eerste echte caféscenario afgerond.' : 'Vanaf 70% verdien je de Lisboa-stempel. Probeer de challenge nog een keer.'}</p>
          <div className="result-grid">
            <div><strong>+{finalProgress.dayResults[5]?.xpEarned ?? 0}</strong><span>XP</span></div>
            <div><strong>{finalProgress.streak}</strong><span>streak</span></div>
            <div><strong>{correctCount}/{day5Challenge.steps.length}</strong><span>goed</span></div>
          </div>
          {passed && <div className="passport-unlock"><span>☕</span><div><small>NIEUWE STEMPEL</small><strong>Café de Lisboa</strong></div></div>}
          <button className="primary-button" onClick={onClose}>{passed ? 'Verder naar Dag 6' : 'Terug naar leerpad'}</button>
        </main>
      )}
    </section>
  );
}
