import { useMemo, useState } from 'react';
import { day1 } from '../data/day1';
import { completeDayOne, type ProgressState } from '../lib/progress';

type Props = {
  onClose: () => void;
  onComplete: (progress: ProgressState) => void;
};

type Phase = 'intro' | 'vocabulary' | 'recall' | 'chunks' | 'listening' | 'grammar' | 'speaking' | 'quiz' | 'result';

const phases: Phase[] = ['intro', 'vocabulary', 'recall', 'chunks', 'listening', 'grammar', 'speaking', 'quiz', 'result'];
const listeningItems = [day1.chunks[0], day1.chunks[1], day1.chunks[3], day1.chunks[5], day1.chunks[7]];

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
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ');
}

export function LessonOverlay({ onClose, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [recallIndex, setRecallIndex] = useState(0);
  const [recallAnswer, setRecallAnswer] = useState('');
  const [recallFeedback, setRecallFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [listeningIndex, setListeningIndex] = useState(0);
  const [listeningRevealed, setListeningRevealed] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [speakingDone, setSpeakingDone] = useState(false);
  const [finalProgress, setFinalProgress] = useState<ProgressState | null>(null);

  const phaseIndex = phases.indexOf(phase);
  const totalProgress = Math.round((phaseIndex / (phases.length - 1)) * 100);
  const currentWord = day1.vocabulary[vocabIndex];
  const recallWord = day1.vocabulary[recallIndex];
  const currentChunk = day1.chunks[chunkIndex];
  const currentListening = listeningItems[listeningIndex];
  const currentQuestion = day1.quiz[quizIndex];

  const result = useMemo(() => {
    const score = Math.round((quizScore / day1.quiz.length) * 100);
    const stars = score >= 90 ? 3 : score >= 75 ? 2 : 1;
    return { score, stars };
  }, [quizScore]);

  function go(next: Phase) {
    setFeedback(null);
    setAnswer('');
    setPhase(next);
  }

  function nextVocabulary() {
    if (vocabIndex < day1.vocabulary.length - 1) setVocabIndex((value) => value + 1);
    else go('recall');
  }

  function checkRecall() {
    const correct = normalize(recallAnswer) === normalize(recallWord.portuguese);
    setRecallFeedback(correct ? 'correct' : 'wrong');
  }

  function nextRecall() {
    if (recallIndex < day1.vocabulary.length - 1) {
      setRecallIndex((value) => value + 1);
      setRecallAnswer('');
      setRecallFeedback(null);
    } else {
      go('chunks');
    }
  }

  function nextChunk() {
    if (chunkIndex < day1.chunks.length - 1) setChunkIndex((value) => value + 1);
    else go('listening');
  }

  function nextListening() {
    if (listeningIndex < listeningItems.length - 1) {
      setListeningIndex((value) => value + 1);
      setListeningRevealed(false);
    } else {
      go('grammar');
    }
  }

  function submitQuiz(choice?: string) {
    if (feedback) return;
    const submitted = choice ?? answer;
    const accepted = [currentQuestion.answer, ...(currentQuestion.alternatives ?? [])].map(normalize);
    const correct = accepted.includes(normalize(submitted));
    if (correct) setQuizScore((value) => value + 1);
    setFeedback(correct ? 'correct' : 'wrong');
    if (choice) setAnswer(choice);
  }

  function continueQuiz() {
    if (quizIndex < day1.quiz.length - 1) {
      setQuizIndex((value) => value + 1);
      setAnswer('');
      setFeedback(null);
      return;
    }

    const finalScore = Math.round((quizScore / day1.quiz.length) * 100);
    const progress = completeDayOne(
      finalScore,
      day1.vocabulary.map((item) => item.id),
      day1.chunks.map((item) => item.id),
    );
    setFinalProgress(progress);
    setPhase('result');
  }

  return (
    <section className="focus-shell" aria-label="Dag 1 les">
      <header className="focus-header">
        <button className="icon-button" onClick={onClose} aria-label="Les sluiten">×</button>
        <span>Dag 1 · {phase === 'result' ? 'Resultaat' : 'Les'}</span>
        <span className="focus-count">{phaseIndex + 1} / {phases.length}</span>
      </header>
      <div className="focus-progress"><span style={{ width: `${totalProgress}%` }} /></div>

      <main className="lesson-player">
        {phase === 'intro' && (
          <section className="lesson-stage intro-stage">
            <div className="eyebrow">DAG 1 VAN 30</div>
            <h1>{day1.title}</h1>
            <p className="lead">{day1.subtitle}</p>
            <div className="lesson-goal-card">
              <small>DOEL VAN VANDAAG</small>
              <p>{day1.goal}</p>
            </div>
            <div className="lesson-breakdown">
              <span>15 woorden</span><span>8 chunks</span><span>5 luisteritems</span><span>10 toetsvragen</span>
            </div>
            <button className="primary-button" onClick={() => go('vocabulary')}>Begin met woorden</button>
          </section>
        )}

        {phase === 'vocabulary' && (
          <section className="lesson-stage flash-stage">
            <div className="stage-meta"><span>WOORDEN LEREN</span><strong>{vocabIndex + 1} / {day1.vocabulary.length}</strong></div>
            <div className="micro-progress"><span style={{ width: `${((vocabIndex + 1) / day1.vocabulary.length) * 100}%` }} /></div>
            <div className="word-card">
              <h1>{currentWord.portuguese}</h1>
              <p>{currentWord.dutch}</p>
              <button className="audio-button" onClick={() => speak(currentWord.portuguese)} aria-label="Luister naar uitspraak">🔊</button>
              {currentWord.example && <div className="example-line">{currentWord.example}</div>}
            </div>
            <button className="primary-button" onClick={nextVocabulary}>{vocabIndex === day1.vocabulary.length - 1 ? 'Test wat je onthoudt' : 'Volgende woord'}</button>
          </section>
        )}

        {phase === 'recall' && (
          <section className="lesson-stage recall-stage">
            <div className="stage-meta"><span>ACTIEF OPHALEN</span><strong>{recallIndex + 1} / {day1.vocabulary.length}</strong></div>
            <div className="micro-progress"><span style={{ width: `${((recallIndex + 1) / day1.vocabulary.length) * 100}%` }} /></div>
            <div className="recall-card">
              <small>HOE ZEG JE:</small>
              <h1>{recallWord.dutch}</h1>
              <input
                autoCapitalize="none"
                autoComplete="off"
                value={recallAnswer}
                disabled={Boolean(recallFeedback)}
                onChange={(event) => setRecallAnswer(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter' && recallAnswer && !recallFeedback) checkRecall(); }}
                placeholder="Typ in het Portugees..."
              />
              {!recallFeedback && <button className="primary-button" disabled={!recallAnswer.trim()} onClick={checkRecall}>Controleren</button>}
              {recallFeedback && <div className={`inline-feedback ${recallFeedback}`}>
                <strong>{recallFeedback === 'correct' ? '✓ Correct' : 'Nog niet helemaal'}</strong>
                {recallFeedback === 'wrong' && <span>Correct: <b>{recallWord.portuguese}</b></span>}
                <button className="secondary-button" onClick={() => speak(recallWord.portuguese)}>🔊 Luister</button>
                <button className="primary-button" onClick={nextRecall}>{recallIndex === day1.vocabulary.length - 1 ? 'Door naar chunks' : 'Volgende'}</button>
              </div>}
            </div>
          </section>
        )}

        {phase === 'chunks' && (
          <section className="lesson-stage flash-stage">
            <div className="stage-meta"><span>CHUNKS</span><strong>{chunkIndex + 1} / {day1.chunks.length}</strong></div>
            <div className="micro-progress"><span style={{ width: `${((chunkIndex + 1) / day1.chunks.length) * 100}%` }} /></div>
            <div className="word-card chunk-card">
              <h1>{currentChunk.portuguese}</h1>
              <p>{currentChunk.dutch}</p>
              <button className="audio-button" onClick={() => speak(currentChunk.portuguese)} aria-label="Luister naar uitspraak">🔊</button>
              <small>Zeg de zin daarna één keer hardop na.</small>
            </div>
            <button className="primary-button" onClick={nextChunk}>{chunkIndex === day1.chunks.length - 1 ? 'Luistertest' : 'Volgende chunk'}</button>
          </section>
        )}

        {phase === 'listening' && (
          <section className="lesson-stage listening-stage">
            <div className="stage-meta"><span>LUISTEREN</span><strong>{listeningIndex + 1} / {listeningItems.length}</strong></div>
            <div className="micro-progress"><span style={{ width: `${((listeningIndex + 1) / listeningItems.length) * 100}%` }} /></div>
            <div className="listening-card">
              <div className="listening-icon">👂</div>
              <h2>Luister zonder de tekst te zien.</h2>
              <button className="audio-button large" onClick={() => speak(currentListening.portuguese)}>▶</button>
              {!listeningRevealed ? (
                <button className="secondary-button" onClick={() => setListeningRevealed(true)}>Toon wat ik hoorde</button>
              ) : (
                <div className="listening-reveal"><strong>{currentListening.portuguese}</strong><span>{currentListening.dutch}</span></div>
              )}
            </div>
            {listeningRevealed && <button className="primary-button" onClick={nextListening}>{listeningIndex === listeningItems.length - 1 ? 'Door naar grammatica' : 'Volgende luisteritem'}</button>}
          </section>
        )}

        {phase === 'grammar' && (
          <section className="lesson-stage grammar-stage">
            <div className="eyebrow">MICROGRAMMATICA</div>
            <h1>{day1.grammar.title}</h1>
            <p className="lead">{day1.grammar.explanation}</p>
            <div className="grammar-examples">
              {day1.grammar.examples.map(([pt, nl]) => (
                <button key={pt} onClick={() => speak(pt)}>
                  <strong>{pt}</strong><span>{nl}</span><b>🔊</b>
                </button>
              ))}
            </div>
            <div className="grammar-rule"><strong>Onthoud vandaag:</strong><span>eu <b>sou</b> · tu <b>és</b></span></div>
            <button className="primary-button" onClick={() => go('speaking')}>Door naar spreken</button>
          </section>
        )}

        {phase === 'speaking' && (
          <section className="lesson-stage speaking-stage">
            <div className="eyebrow">SPREKEN</div>
            <h1>{day1.speaking.title}</h1>
            <p className="lead">{day1.speaking.prompt}</p>
            <div className="speak-orb" aria-hidden="true">🎙</div>
            <p className="speak-hint">Spreek nu hardop. Automatische spraakbeoordeling voegen we in een latere versie toe.</p>
            <button className="secondary-button" onClick={() => speak(day1.speaking.model)}>🔊 Luister naar voorbeeld</button>
            <button className={`self-check ${speakingDone ? 'checked' : ''}`} onClick={() => setSpeakingDone((value) => !value)}>
              <span>{speakingDone ? '✓' : '○'}</span> Ik heb mijn introductie hardop gedaan
            </button>
            <button className="primary-button" disabled={!speakingDone} onClick={() => go('quiz')}>Start dagtoets</button>
          </section>
        )}

        {phase === 'quiz' && (
          <section className="lesson-stage quiz-stage">
            <div className="stage-meta"><span>DAGTOETS</span><strong>{quizIndex + 1} / {day1.quiz.length}</strong></div>
            <div className="micro-progress"><span style={{ width: `${((quizIndex + 1) / day1.quiz.length) * 100}%` }} /></div>
            <div className="quiz-question">
              <h2>{currentQuestion.prompt}</h2>
              {currentQuestion.type === 'input' ? (
                <>
                  <input autoCapitalize="none" autoComplete="off" value={answer} disabled={Boolean(feedback)} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && answer && !feedback) submitQuiz(); }} placeholder="Typ je antwoord..." />
                  {!feedback && <button className="primary-button" disabled={!answer.trim()} onClick={() => submitQuiz()}>Controleren</button>}
                </>
              ) : (
                <div className="choice-list">
                  {currentQuestion.options?.map((option) => (
                    <button key={option} className={feedback && option === currentQuestion.answer ? 'correct-choice' : feedback && option === answer ? 'wrong-choice' : ''} disabled={Boolean(feedback)} onClick={() => submitQuiz(option)}>{option}</button>
                  ))}
                </div>
              )}
            </div>

            {feedback && (
              <div className={`quiz-feedback ${feedback}`}>
                <strong>{feedback === 'correct' ? '✓ Correct' : 'Nog niet helemaal'}</strong>
                {feedback === 'wrong' && <span>Correct antwoord: <b>{currentQuestion.answer}</b></span>}
                <button className="primary-button" onClick={continueQuiz}>{quizIndex === day1.quiz.length - 1 ? 'Bekijk resultaat' : 'Volgende vraag'}</button>
              </div>
            )}
          </section>
        )}

        {phase === 'result' && finalProgress && (
          <section className="lesson-stage result-stage">
            <div className="result-mark">✓</div>
            <div className="eyebrow">DIA 1 COMPLETO</div>
            <h1>{result.score}%</h1>
            <div className="result-stars">{'★'.repeat(result.stars)}{'☆'.repeat(3 - result.stars)}</div>
            <p>Je eerste Portugese les is afgerond.</p>
            <div className="result-grid">
              <div><strong>+{finalProgress.dayResults[1]?.xpEarned ?? 0}</strong><span>XP</span></div>
              <div><strong>{finalProgress.streak}</strong><span>dag streak</span></div>
              <div><strong>15</strong><span>woorden</span></div>
            </div>
            <div className="result-next"><small>VOLGENDE</small><strong>Dag 2 · Persoonlijke informatie</strong><span>Leeftijd, woonplaats en talen.</span></div>
            <button className="primary-button" onClick={() => { onComplete(finalProgress); onClose(); }}>Terug naar Home</button>
          </section>
        )}
      </main>
    </section>
  );
}
