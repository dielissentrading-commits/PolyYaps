import { useEffect, useMemo, useState } from 'react';
import { completeLesson, type ProgressState } from '../lib/progress';
import { descriptorFromItem, ensureItems, recordAttempt } from '../lib/learningDb';
import { normalizePortuguese, speakPt } from '../lib/speech';
import { SpeechPractice } from './SpeechPractice';
import type { LessonContent } from '../types/learning';

type Props = {
  lesson: LessonContent;
  onClose: () => void;
  onComplete: (progress: ProgressState) => void;
  onMasteryChanged?: () => void;
};

type Phase = 'intro' | 'vocabulary' | 'recall' | 'chunks' | 'listening' | 'grammar' | 'speaking' | 'quiz' | 'result';
const phases: Phase[] = ['intro', 'vocabulary', 'recall', 'chunks', 'listening', 'grammar', 'speaking', 'quiz', 'result'];

export function LessonOverlayV1({ lesson, onClose, onComplete, onMasteryChanged }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [vocabIndex, setVocabIndex] = useState(0);
  const [recallIndex, setRecallIndex] = useState(0);
  const [recallAnswer, setRecallAnswer] = useState('');
  const [recallFeedback, setRecallFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [chunkIndex, setChunkIndex] = useState(0);
  const [listeningIndex, setListeningIndex] = useState(0);
  const [listeningRevealed, setListeningRevealed] = useState(false);
  const [listeningAssessment, setListeningAssessment] = useState<boolean | null>(null);
  const [speakingScore, setSpeakingScore] = useState<number | null>(null);
  const [speakingRecorded, setSpeakingRecorded] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finalProgress, setFinalProgress] = useState<ProgressState | null>(null);
  const [finalScore, setFinalScore] = useState(0);

  const listeningItems = useMemo(() => {
    const picks = [0, 1, 3, 5, 7].filter((index) => index < lesson.chunks.length);
    return picks.map((index) => lesson.chunks[index]);
  }, [lesson]);

  useEffect(() => {
    const items = [
      ...lesson.vocabulary.map((item) => descriptorFromItem(lesson.day, 'word', item)),
      ...lesson.chunks.map((item) => descriptorFromItem(lesson.day, 'chunk', item)),
    ];
    void ensureItems(items);
  }, [lesson]);

  const phaseIndex = phases.indexOf(phase);
  const currentWord = lesson.vocabulary[vocabIndex];
  const recallWord = lesson.vocabulary[recallIndex];
  const currentChunk = lesson.chunks[chunkIndex];
  const currentListening = listeningItems[listeningIndex];
  const currentQuestion = lesson.quiz[quizIndex];
  const stars = finalScore >= 90 ? 3 : finalScore >= 75 ? 2 : 1;

  function go(next: Phase) {
    setFeedback(null);
    setAnswer('');
    setPhase(next);
  }

  async function nextVocabulary() {
    await recordAttempt(descriptorFromItem(lesson.day, 'word', currentWord), 'exposure', true);
    if (vocabIndex < lesson.vocabulary.length - 1) setVocabIndex((value) => value + 1);
    else go('recall');
  }

  async function checkRecall() {
    const correct = normalizePortuguese(recallAnswer) === normalizePortuguese(recallWord.portuguese);
    setRecallFeedback(correct ? 'correct' : 'wrong');
    await recordAttempt(descriptorFromItem(lesson.day, 'word', recallWord), 'recall', correct);
  }

  function nextRecall() {
    if (recallIndex < lesson.vocabulary.length - 1) {
      setRecallIndex((value) => value + 1);
      setRecallAnswer('');
      setRecallFeedback(null);
    } else go('chunks');
  }

  async function nextChunk() {
    await recordAttempt(descriptorFromItem(lesson.day, 'chunk', currentChunk), 'exposure', true);
    if (chunkIndex < lesson.chunks.length - 1) setChunkIndex((value) => value + 1);
    else go('listening');
  }

  async function assessListening(correct: boolean) {
    setListeningAssessment(correct);
    await recordAttempt(descriptorFromItem(lesson.day, 'chunk', currentListening), 'listening', correct);
  }

  function nextListening() {
    if (listeningIndex < listeningItems.length - 1) {
      setListeningIndex((value) => value + 1);
      setListeningRevealed(false);
      setListeningAssessment(null);
    } else go('grammar');
  }

  async function assessSpeaking(score: number) {
    setSpeakingScore(score);
    if (speakingRecorded) return;
    const passed = score >= 55;
    if (passed) {
      setSpeakingRecorded(true);
      for (const id of lesson.speaking.chunkIds ?? []) {
        const chunk = lesson.chunks.find((item) => item.id === id);
        if (chunk) await recordAttempt(descriptorFromItem(lesson.day, 'chunk', chunk), 'speaking', true);
      }
      onMasteryChanged?.();
    }
  }

  async function submitQuiz(choice?: string) {
    if (feedback) return;
    const submitted = choice ?? answer;
    const accepted = [currentQuestion.answer, ...(currentQuestion.alternatives ?? [])].map(normalizePortuguese);
    const correct = accepted.includes(normalizePortuguese(submitted));
    if (correct) setQuizScore((value) => value + 1);
    setFeedback(correct ? 'correct' : 'wrong');
    if (choice) setAnswer(choice);
    if (currentQuestion.itemRef) {
      const source = currentQuestion.itemRef.type === 'word' ? lesson.vocabulary : lesson.chunks;
      const item = source.find((candidate) => candidate.id === currentQuestion.itemRef?.id);
      if (item) await recordAttempt(descriptorFromItem(lesson.day, currentQuestion.itemRef.type, item), 'quiz', correct);
    }
  }

  function continueQuiz() {
    if (quizIndex < lesson.quiz.length - 1) {
      setQuizIndex((value) => value + 1);
      setAnswer('');
      setFeedback(null);
      return;
    }
    const score = Math.round((quizScore / lesson.quiz.length) * 100);
    const progress = completeLesson(lesson.day, score, lesson.vocabulary.map((item) => item.id), lesson.chunks.map((item) => item.id));
    setFinalScore(score);
    setFinalProgress(progress);
    setPhase('result');
  }

  function finish() {
    if (finalProgress) onComplete(finalProgress);
    onMasteryChanged?.();
    onClose();
  }

  return (
    <section className="focus-shell" aria-label={`Dag ${lesson.day} les`}>
      <header className="focus-header"><button className="icon-button" onClick={onClose} aria-label="Les sluiten">×</button><span>Dag {lesson.day} · {phase === 'result' ? 'Resultaat' : 'Les'}</span><span className="focus-count">{phaseIndex + 1} / {phases.length}</span></header>
      <div className="focus-progress"><span style={{ width: `${Math.round((phaseIndex / (phases.length - 1)) * 100)}%` }} /></div>

      <main className="lesson-player">
        {phase === 'intro' && <section className="lesson-stage intro-stage"><div className="eyebrow">DAG {lesson.day} VAN 30</div><h1>{lesson.title}</h1><p className="lead">{lesson.subtitle}</p><div className="lesson-goal-card"><small>DOEL VAN VANDAAG</small><p>{lesson.goal}</p></div><div className="lesson-breakdown"><span>{lesson.vocabulary.length} woorden</span><span>{lesson.chunks.length} chunks</span><span>{listeningItems.length} luisteritems</span><span>{lesson.quiz.length} toetsvragen</span></div><button className="primary-button" onClick={() => go('vocabulary')}>Begin les</button></section>}

        {phase === 'vocabulary' && <section className="lesson-stage flash-stage"><div className="stage-meta"><span>WOORDEN</span><strong>{vocabIndex + 1}/{lesson.vocabulary.length}</strong></div><div className="micro-progress"><span style={{ width: `${((vocabIndex + 1) / lesson.vocabulary.length) * 100}%` }} /></div><div className="word-card"><h1>{currentWord.portuguese}</h1><p>{currentWord.dutch}</p><button className="audio-button" onClick={() => speakPt(currentWord.portuguese)}>🔊</button></div><button className="primary-button" onClick={() => void nextVocabulary()}>{vocabIndex === lesson.vocabulary.length - 1 ? 'Actief ophalen' : 'Volgende'}</button></section>}

        {phase === 'recall' && <section className="lesson-stage recall-stage"><div className="stage-meta"><span>ACTIEF OPHALEN</span><strong>{recallIndex + 1}/{lesson.vocabulary.length}</strong></div><div className="recall-card"><small>HOE ZEG JE:</small><h1>{recallWord.dutch}</h1><input autoCapitalize="none" value={recallAnswer} disabled={Boolean(recallFeedback)} onChange={(event) => setRecallAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && recallAnswer && !recallFeedback) void checkRecall(); }} placeholder="Typ in het Portugees…" />{!recallFeedback && <button className="primary-button" disabled={!recallAnswer.trim()} onClick={() => void checkRecall()}>Controleren</button>}{recallFeedback && <div className={`inline-feedback ${recallFeedback}`}><strong>{recallFeedback === 'correct' ? '✓ Correct' : 'Nog niet helemaal'}</strong>{recallFeedback === 'wrong' && <span>Correct: <b>{recallWord.portuguese}</b></span>}<button className="secondary-button" onClick={() => speakPt(recallWord.portuguese)}>🔊 Luister</button><button className="primary-button" onClick={nextRecall}>{recallIndex === lesson.vocabulary.length - 1 ? 'Door naar chunks' : 'Volgende'}</button></div>}</div></section>}

        {phase === 'chunks' && <section className="lesson-stage flash-stage"><div className="stage-meta"><span>CHUNKS</span><strong>{chunkIndex + 1}/{lesson.chunks.length}</strong></div><div className="word-card chunk-card"><h1>{currentChunk.portuguese}</h1><p>{currentChunk.dutch}</p><button className="audio-button" onClick={() => speakPt(currentChunk.portuguese)}>🔊</button><small>Zeg de zin hardop na.</small></div><button className="primary-button" onClick={() => void nextChunk()}>{chunkIndex === lesson.chunks.length - 1 ? 'Luisteren' : 'Volgende'}</button></section>}

        {phase === 'listening' && currentListening && <section className="lesson-stage listening-stage"><div className="stage-meta"><span>LUISTEREN</span><strong>{listeningIndex + 1}/{listeningItems.length}</strong></div><div className="listening-card"><div className="listening-icon">👂</div><h2>Luister zonder tekst.</h2><button className="audio-button large" onClick={() => speakPt(currentListening.portuguese)}>▶</button>{!listeningRevealed ? <button className="secondary-button" onClick={() => setListeningRevealed(true)}>Toon tekst</button> : <><div className="listening-reveal"><strong>{currentListening.portuguese}</strong><span>{currentListening.dutch}</span></div>{listeningAssessment === null && <div className="assessment-row"><button onClick={() => void assessListening(false)}>Nog lastig</button><button onClick={() => void assessListening(true)}>Ik verstond dit</button></div>}</>}</div>{listeningAssessment !== null && <button className="primary-button" onClick={nextListening}>{listeningIndex === listeningItems.length - 1 ? 'Grammatica' : 'Volgende'}</button>}</section>}

        {phase === 'grammar' && <section className="lesson-stage grammar-stage"><div className="eyebrow">MICROGRAMMATICA</div><h1>{lesson.grammar.title}</h1><p className="lead">{lesson.grammar.explanation}</p><div className="grammar-examples">{lesson.grammar.examples.map(([pt, nl]) => <button key={pt} onClick={() => speakPt(pt)}><strong>{pt}</strong><span>{nl}</span><b>🔊</b></button>)}</div><div className="grammar-rule"><strong>Onthoud:</strong><span>{lesson.grammar.rule}</span></div><button className="primary-button" onClick={() => go('speaking')}>Spreken</button></section>}

        {phase === 'speaking' && <section className="lesson-stage speaking-stage"><div className="eyebrow">SPREKEN</div><h1>{lesson.speaking.title}</h1><SpeechPractice prompt={lesson.speaking.prompt} model={lesson.speaking.model} onAssessment={(score) => void assessSpeaking(score)} /><button className="primary-button" disabled={speakingScore === null || speakingScore < 55} onClick={() => go('quiz')}>Start dagtoets</button>{speakingScore !== null && speakingScore < 55 && <button className="text-button" onClick={() => { setSpeakingScore(55); void assessSpeaking(55); }}>Ga door na zelfcontrole</button>}</section>}

        {phase === 'quiz' && <section className="lesson-stage quiz-stage"><div className="stage-meta"><span>DAGTOETS</span><strong>{quizIndex + 1}/{lesson.quiz.length}</strong></div><div className="quiz-question"><h2>{currentQuestion.prompt}</h2>{currentQuestion.type === 'input' ? <><input autoCapitalize="none" value={answer} disabled={Boolean(feedback)} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && answer && !feedback) void submitQuiz(); }} placeholder="Typ je antwoord…" />{!feedback && <button className="primary-button" disabled={!answer.trim()} onClick={() => void submitQuiz()}>Controleren</button>}</> : <div className="choice-list">{currentQuestion.options?.map((option) => <button key={option} disabled={Boolean(feedback)} className={feedback && option === currentQuestion.answer ? 'correct-choice' : feedback && option === answer ? 'wrong-choice' : ''} onClick={() => void submitQuiz(option)}>{option}</button>)}</div>}</div>{feedback && <div className={`quiz-feedback ${feedback}`}><strong>{feedback === 'correct' ? '✓ Correct' : 'Nog niet helemaal'}</strong>{feedback === 'wrong' && <span>Correct: <b>{currentQuestion.answer}</b></span>}<button className="primary-button" onClick={continueQuiz}>{quizIndex === lesson.quiz.length - 1 ? 'Resultaat' : 'Volgende'}</button></div>}</section>}

        {phase === 'result' && finalProgress && <section className="lesson-stage result-stage"><div className="result-mark">✓</div><div className="eyebrow">DIA {lesson.day} COMPLETO</div><h1>{finalScore}%</h1><div className="result-stars">{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</div><p>{finalScore >= 90 ? 'Muito bem. Sterke les.' : finalScore >= 75 ? 'Goed gedaan. Zwakke items komen automatisch terug.' : 'Afgerond. Smart Review neemt de lastige items over.'}</p><div className="result-grid"><div><strong>+{finalProgress.dayResults[lesson.day]?.xpEarned ?? 0}</strong><span>XP</span></div><div><strong>{finalProgress.streak}</strong><span>streak</span></div><div><strong>{lesson.vocabulary.length + lesson.chunks.length}</strong><span>items</span></div></div><button className="primary-button" onClick={finish}>Naar Home</button></section>}
      </main>
    </section>
  );
}
