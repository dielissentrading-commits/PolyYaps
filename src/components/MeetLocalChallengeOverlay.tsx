import { useMemo, useState } from 'react';
import { day10Challenge } from '../data/day10Challenge';
import { completeChallenge, type ProgressState } from '../lib/progress';
import { descriptorFromItem, ensureItems, recordAttempt } from '../lib/learningDb';
import type { ChallengeStep, ItemDescriptor } from '../types/learning';

type Props = {
  onClose: () => void;
  onComplete: (progress: ProgressState) => void;
  onMasteryChanged?: () => void;
};

type Phase = 'intro' | 'toolkit' | 'conversation' | 'result';
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
  return value.trim().toLocaleLowerCase('pt-PT').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.,!?]/g, '').replace(/\s+/g, ' ');
}

const toolkitDescriptors: ItemDescriptor[] = [
  ...day10Challenge.toolkit.vocabulary.map((item) => descriptorFromItem(10, 'word', item)),
  ...day10Challenge.toolkit.chunks.map((item) => descriptorFromItem(10, 'chunk', item)),
];

function descriptorForStep(step: ChallengeStep) {
  if (!step.itemRef) return undefined;
  return toolkitDescriptors.find((item) => item.itemType === step.itemRef?.type && item.itemId === step.itemRef?.id);
}

export function MeetLocalChallengeOverlay({ onClose, onComplete, onMasteryChanged }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finalProgress, setFinalProgress] = useState<ProgressState | null>(null);
  const currentStep = day10Challenge.steps[stepIndex];

  const score = useMemo(() => Math.round((correctCount / day10Challenge.steps.length) * 100), [correctCount]);
  const passed = score >= 70;
  const stars = score >= 90 ? 3 : score >= 75 ? 2 : 1;

  async function startConversation() {
    try {
      await ensureItems(toolkitDescriptors);
      for (const item of toolkitDescriptors) await recordAttempt(item, 'exposure', true);
      onMasteryChanged?.();
    } catch {
      // Conversation remains playable without storage.
    }
    setPhase('conversation');
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
        const evidence = currentStep.line ? 'context' : 'recall';
        await recordAttempt(descriptor, evidence, correct);
        onMasteryChanged?.();
      } catch {
        // Challenge scoring is independent of IndexedDB availability.
      }
    }
  }

  function continueConversation() {
    const nextCorrect = correctCount + (feedback === 'correct' ? 1 : 0);
    if (stepIndex < day10Challenge.steps.length - 1) {
      setCorrectCount(nextCorrect);
      setStepIndex((value) => value + 1);
      setAnswer('');
      setFeedback(null);
      return;
    }

    const finalScore = Math.round((nextCorrect / day10Challenge.steps.length) * 100);
    const progress = completeChallenge(
      10,
      finalScore,
      day10Challenge.rewardXp,
      day10Challenge.stampId,
      day10Challenge.toolkit.vocabulary.map((item) => item.id),
      day10Challenge.toolkit.chunks.map((item) => item.id),
      'sem-ingles',
    );
    setCorrectCount(nextCorrect);
    setFinalProgress(progress);
    setPhase('result');
    onComplete(progress);
  }

  return (
    <section className="focus-shell social-challenge-shell" aria-label="Meet a Local Dag 10">
      <header className="focus-header">
        <button className="icon-button" onClick={onClose} aria-label="Challenge sluiten">×</button>
        <span>Dag 10 · Meet a Local</span>
        <span className="focus-count">{phase === 'conversation' ? `${stepIndex + 1}/${day10Challenge.steps.length}` : 'Coimbra'}</span>
      </header>
      <div className="focus-progress"><span style={{ width: phase === 'intro' ? '8%' : phase === 'toolkit' ? '22%' : phase === 'conversation' ? `${22 + ((stepIndex + 1) / day10Challenge.steps.length) * 68}%` : '100%' }} /></div>

      {phase === 'intro' && (
        <main className="lesson-stage challenge-intro">
          <div className="challenge-badge social">💬</div>
          <div className="eyebrow">CHECKPOINT · COIMBRA</div>
          <h1>{day10Challenge.title}</h1>
          <p className="lead">{day10Challenge.subtitle}</p>
          <div className="challenge-reward-card"><small>BELONING BIJ 70%+</small><strong>+{day10Challenge.rewardXp} XP</strong><span>{day10Challenge.stampLabel} · paspoortstempel</span></div>
          <button className="primary-button" onClick={() => setPhase('toolkit')}>Bekijk gesprekstechniek</button>
        </main>
      )}

      {phase === 'toolkit' && (
        <main className="lesson-stage toolkit-stage">
          <div className="eyebrow">GESPREKSTECHNIEK</div>
          <h1>A + U + R + W</h1>
          <p className="lead">Voorkom antwoorden van één woord. Geef antwoord, breid uit, geef een reden en kaats een vraag terug.</p>
          <div className="conversation-formula">
            <span><b>A</b> Antwoord</span><span><b>U</b> Uitbreiding</span><span><b>R</b> Reden</span><span><b>W</b> Wedervraag</span>
          </div>
          <div className="toolkit-chunks">
            {day10Challenge.toolkit.chunks.map((chunk) => <button key={chunk.id} onClick={() => speak(chunk.portuguese)}><span><strong>{chunk.portuguese}</strong><small>{chunk.dutch}</small></span><b>🔊</b></button>)}
          </div>
          <button className="primary-button" onClick={() => void startConversation()}>Ontmoet een local</button>
        </main>
      )}

      {phase === 'conversation' && (
        <main className="lesson-stage challenge-scenario social-scenario">
          <div className="stage-meta"><span>GESPREK IN COIMBRA</span><strong>{stepIndex + 1} / {day10Challenge.steps.length}</strong></div>
          <div className="micro-progress"><span style={{ width: `${((stepIndex + 1) / day10Challenge.steps.length) * 100}%` }} /></div>

          {currentStep.line && (
            <div className="local-bubble">
              <div className="local-avatar">P</div>
              <div><small>PORTUGESE LOCAL</small><strong>{currentStep.line}</strong></div>
              <button onClick={() => speak(currentStep.line ?? '')} aria-label="Luister naar local">🔊</button>
            </div>
          )}

          <div className="challenge-question">
            <small>JOUW ANTWOORD</small>
            <h2>{currentStep.prompt}</h2>
            {currentStep.type === 'input' ? <><input autoCapitalize="none" autoComplete="off" value={answer} disabled={Boolean(feedback)} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && answer.trim() && !feedback) void submit(); }} placeholder="Antwoord in het Portugees..." />{!feedback && <button className="primary-button" disabled={!answer.trim()} onClick={() => void submit()}>Antwoorden</button>}</> : <div className="choice-list">{currentStep.options?.map((option) => <button key={option} className={feedback && option === currentStep.answer ? 'correct-choice' : feedback && option === answer ? 'wrong-choice' : ''} disabled={Boolean(feedback)} onClick={() => void submit(option)}>{option}</button>)}</div>}
          </div>

          {feedback && <div className={`quiz-feedback ${feedback}`}><strong>{feedback === 'correct' ? '✓ Boa conversa!' : 'Probeer je antwoord langer te maken'}</strong>{feedback === 'wrong' && <span>Een sterk antwoord is: <b>{currentStep.answer}</b></span>}<button className="primary-button" onClick={continueConversation}>{stepIndex === day10Challenge.steps.length - 1 ? 'Bekijk gespreksscore' : 'Verder praten'}</button></div>}
        </main>
      )}

      {phase === 'result' && finalProgress && (
        <main className="lesson-stage result-stage challenge-result">
          <div className={`result-mark ${passed ? '' : 'challenge-fail'}`}>{passed ? '✓' : '↻'}</div>
          <div className="eyebrow">{passed ? 'CONVERSA COMPLETA' : 'NOG ÉÉN POGING'}</div>
          <h1>{score}%</h1>
          <div className="result-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
          <p>{passed ? 'Je hebt een eenvoudig gesprek gaande gehouden zonder Engels.' : 'Vanaf 70% verdien je de Coimbra-stempel. Herhaal je zwakke antwoordtypes en probeer opnieuw.'}</p>
          <div className="result-grid"><div><strong>+{finalProgress.dayResults[10]?.xpEarned ?? 0}</strong><span>XP</span></div><div><strong>{finalProgress.streak}</strong><span>streak</span></div><div><strong>{finalProgress.passportStamps.length}</strong><span>stempels</span></div></div>
          {passed && <div className="passport-unlock"><span>💬</span><div><small>PASPOORTSTEMPEL</small><strong>Conversa de Coimbra</strong></div></div>}
          <button className="primary-button" onClick={onClose}>Naar Home</button>
        </main>
      )}
    </section>
  );
}
