import { useEffect, useMemo, useState } from 'react';
import { getAllMastery, getDueItems, recordAttempt } from '../lib/learningDb';
import type { EvidenceType, MasteryRecord } from '../types/learning';

type Props = {
  onClose: () => void;
  onChanged?: () => void;
};

type Feedback = 'correct' | 'wrong' | null;

const weaknessLabels: Record<string, string> = {
  SER_VS_ESTAR: 'ser vs. estar',
  TER_AGE: 'ter voor leeftijd',
  TER_STATES: 'ter bij honger/dorst',
  QUERIA_REQUEST: 'beleefd bestellen',
  NUMBERS: 'getallen & prijzen',
  PAYMENT: 'betalen',
  TIME: 'tijd',
};

function weaknessLabel(category?: string) {
  if (!category) return undefined;
  return weaknessLabels[category] ?? category.toLowerCase().replaceAll('_', ' ');
}

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

function choicesFor(item: MasteryRecord, pool: MasteryRecord[]) {
  const distractors = pool.filter((candidate) => candidate.key !== item.key && candidate.dutch !== item.dutch).map((candidate) => candidate.dutch);
  const unique = Array.from(new Set(distractors)).slice(0, 2);
  return [item.dutch, ...unique].sort((a, b) => (a + item.key).localeCompare(b + item.key));
}

export function SmartReviewOverlay({ onClose, onChanged }: Props) {
  const [queue, setQueue] = useState<MasteryRecord[]>([]);
  const [pool, setPool] = useState<MasteryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void Promise.all([getDueItems(15), getAllMastery()]).then(([due, all]) => {
      setQueue(due);
      setPool(all.filter((item) => item.timesSeen > 0));
      setLoading(false);
    });
  }, []);

  const item = queue[index];
  const mode = useMemo<'recognition' | 'recall' | 'listening'>(() => {
    if (!item) return 'recall';
    if (index % 3 === 2) return 'listening';
    return item.masteryLevel <= 1 ? 'recognition' : 'recall';
  }, [index, item]);
  const options = useMemo(() => item ? choicesFor(item, pool) : [], [item, pool]);
  const focusLabel = weaknessLabel(item?.weaknessCategory);

  async function grade(submitted: string) {
    if (!item || feedback) return;
    const expected = mode === 'recall' ? item.portuguese : item.dutch;
    const correct = normalize(submitted) === normalize(expected);
    const evidence: EvidenceType = mode === 'recall' ? 'recall' : mode === 'listening' ? 'listening' : 'recognition';
    setAnswer(submitted);
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) setCorrectCount((value) => value + 1);
    await recordAttempt(item, evidence, correct);
  }

  function next() {
    if (index >= queue.length - 1) {
      setComplete(true);
      onChanged?.();
      return;
    }
    setIndex((value) => value + 1);
    setAnswer('');
    setFeedback(null);
  }

  if (loading) return <section className="focus-shell"><main className="review-player-empty"><strong>Smart Review laden…</strong></main></section>;

  if (!queue.length) {
    return (
      <section className="focus-shell">
        <header className="focus-header"><button className="icon-button" onClick={onClose}>×</button><span>Smart Review</span><span /></header>
        <main className="review-player-empty"><div className="result-mark">✓</div><h1>Alles bijgewerkt</h1><p>Er zijn nu geen items aan een herhaling toe. PolyYaps plant ze automatisch opnieuw in.</p><button className="primary-button" onClick={onClose}>Terug</button></main>
      </section>
    );
  }

  if (complete) {
    const score = Math.round((correctCount / queue.length) * 100);
    return (
      <section className="focus-shell">
        <header className="focus-header"><button className="icon-button" onClick={onClose}>×</button><span>Smart Review</span><span /></header>
        <main className="review-player-empty"><div className="result-mark">✓</div><div className="eyebrow">REVIEW COMPLETO</div><h1>{score}%</h1><p>{queue.length} items opnieuw getest. De nieuwe reviewdatums en patroonsterktes zijn opgeslagen.</p><button className="primary-button" onClick={onClose}>Naar Home</button></main>
      </section>
    );
  }

  return (
    <section className="focus-shell">
      <header className="focus-header"><button className="icon-button" onClick={onClose}>×</button><span>Smart Review</span><span className="focus-count">{index + 1} / {queue.length}</span></header>
      <div className="focus-progress"><span style={{ width: `${((index + 1) / queue.length) * 100}%` }} /></div>
      <main className="lesson-player">
        <section className="lesson-stage review-exercise-stage">
          <div className="stage-meta"><span>{mode === 'recall' ? 'ACTIEF OPHALEN' : mode === 'listening' ? 'LUISTEREN' : 'HERKENNEN'}</span><strong>sterkte {item.strength}</strong></div>
          {focusLabel && <div className="review-focus-chip">Focus · {focusLabel}</div>}
          <div className="review-prompt-card">
            {mode === 'recall' && <><small>HOE ZEG JE:</small><h1>{item.dutch}</h1><input autoCapitalize="none" autoComplete="off" value={answer} disabled={Boolean(feedback)} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && answer && !feedback) void grade(answer); }} placeholder="Typ in het Portugees…" />{!feedback && <button className="primary-button" disabled={!answer.trim()} onClick={() => void grade(answer)}>Controleren</button>}</>}
            {mode === 'recognition' && <><small>WAT BETEKENT:</small><h1>{item.portuguese}</h1><div className="choice-list">{options.map((option) => <button key={option} disabled={Boolean(feedback)} className={feedback && option === item.dutch ? 'correct-choice' : feedback && option === answer ? 'wrong-choice' : ''} onClick={() => void grade(option)}>{option}</button>)}</div></>}
            {mode === 'listening' && <><small>LUISTER ZONDER TE LEZEN</small><button className="review-audio-orb" onClick={() => speak(item.portuguese)}>▶</button><div className="choice-list">{options.map((option) => <button key={option} disabled={Boolean(feedback)} className={feedback && option === item.dutch ? 'correct-choice' : feedback && option === answer ? 'wrong-choice' : ''} onClick={() => void grade(option)}>{option}</button>)}</div></>}
          </div>
          {feedback && <div className={`inline-feedback ${feedback}`}><strong>{feedback === 'correct' ? '✓ Correct' : 'Nog niet helemaal'}</strong>{feedback === 'wrong' && <span>Correct: <b>{mode === 'recall' ? item.portuguese : item.dutch}</b></span>}<div className="mastery-feedback"><span>Mastery {item.masteryLevel}/4</span><span>{focusLabel ? `${focusLabel} bijgewerkt` : 'Review opnieuw ingepland'}</span></div><button className="primary-button" onClick={next}>{index === queue.length - 1 ? 'Bekijk resultaat' : 'Volgende'}</button></div>}
        </section>
      </main>
    </section>
  );
}
