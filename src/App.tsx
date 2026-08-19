import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { LessonOverlay } from './components/LessonOverlay';
import { lessons } from './data/mockData';
import { loadProgress, type ProgressState } from './lib/progress';

type Tab = 'home' | 'learn' | 'review' | 'progress';

function Stars({ count = 0 }: { count?: number }) {
  return <span className="stars" aria-label={`${count} sterren`}>{'★'.repeat(count)}{'☆'.repeat(Math.max(0, 3 - count))}</span>;
}

function Home({ progress, onStartLesson, onGoReview }: { progress: ProgressState; onStartLesson: () => void; onGoReview: () => void }) {
  const completed = progress.completedDays.includes(1);
  const dayOne = progress.dayResults[1];

  return (
    <main className="page home-page">
      <header className="brand-row">
        <div className="wordmark">Poly<span>Yaps</span></div>
        <button className="icon-button small" aria-label="Instellingen">···</button>
      </header>

      <section className="greeting">
        <h1>Olá, Duran</h1>
        <p>{completed ? 'Je eerste Portugese les staat in de boeken.' : 'Klaar voor je eerste Portugese les?'}</p>
      </section>

      <div className="stat-strip">
        <span>🔥 <strong>{progress.streak} {progress.streak === 1 ? 'dag' : 'dagen'}</strong></span>
        <span>✦ <strong>{progress.totalXp} XP</strong></span>
        <span>⌁ <strong>Level {progress.totalXp >= 100 ? 2 : 1}</strong></span>
      </div>

      <section className="daily-card">
        <div className="eyebrow">{completed ? 'DAG 1 AFGEROND' : 'DAG 1 VAN 30'}</div>
        <h2>Begroeten & jezelf voorstellen</h2>
        <p>{completed ? `Je scoorde ${dayOne?.score ?? 0}%. Herhalen mag altijd.` : 'Leer iemand begroeten, je naam noemen en vertellen waar je vandaan komt.'}</p>
        <div className="progress-line"><span style={{ width: completed ? '100%' : '0%' }} /></div>
        <div className="card-meta"><span>{completed ? 'Les voltooid' : '± 60 minuten'}</span><strong>{completed ? <Stars count={dayOne?.stars ?? 1} /> : '0%'}</strong></div>
        <button className="primary-button" onClick={onStartLesson}>{completed ? 'Herhaal Dag 1' : 'Start Dag 1'}</button>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Vandaag</h3></div>
        <button className="action-card" onClick={onGoReview}>
          <span className="action-icon">↻</span>
          <span className="action-copy"><strong>Smart Review</strong><small>{completed ? 'Je eerste items zijn opgeslagen' : 'Wordt actief na je eerste les'}</small></span>
          <span className="chevron">›</span>
        </button>
        <div className="focus-card">
          <span className="action-icon">◎</span>
          <div className="action-copy"><small>{completed ? 'Volgende les' : 'Focus vandaag'}</small><strong>{completed ? 'Dag 2 · Persoonlijke informatie' : 'eu sou · tu és'}</strong><span>{completed ? 'Leeftijd, woonplaats en talen' : 'ser gebruiken voor identiteit'}</span></div>
        </div>
      </section>

      <section className="mini-mastery">
        <div><strong>{progress.learnedWords.length}</strong><span>woorden</span></div>
        <div><strong>{progress.learnedChunks.length}</strong><span>chunks</span></div>
        <div><strong>{progress.completedDays.length}</strong><span>lessen</span></div>
      </section>
    </main>
  );
}

function Learn({ progress, onStartLesson }: { progress: ProgressState; onStartLesson: () => void }) {
  const dayOne = progress.dayResults[1];
  return (
    <main className="page learn-page">
      <header className="page-header">
        <div><div className="eyebrow">30 DAGEN</div><h1>Je route door Portugal</h1></div>
        <span className="route-progress">{progress.completedDays.length}/30</span>
      </header>
      <p className="lead compact">Dag 1 is nu volledig speelbaar. De rest van het curriculum staat al klaar voor de volgende releases.</p>

      <section className="learning-path">
        {lessons.map((lesson, index) => {
          const dayOneComplete = lesson.day === 1 && progress.completedDays.includes(1);
          const status = lesson.day === 1 ? (dayOneComplete ? 'complete' : 'current') : 'upcoming';
          const isChallenge = lesson.day % 5 === 0;
          return (
            <div className="path-row" key={lesson.day}>
              <div className={`path-line ${index === lessons.length - 1 ? 'last' : ''}`} />
              <button
                className={`path-node ${status} ${isChallenge ? 'challenge' : ''}`}
                onClick={lesson.day === 1 ? onStartLesson : undefined}
                aria-label={`Dag ${lesson.day}: ${lesson.title}`}
              >
                <span>{dayOneComplete ? '✓' : isChallenge ? '✦' : lesson.day}</span>
              </button>
              <div className={`path-copy ${status}`}>
                {lesson.city && <small>{lesson.city.toUpperCase()}</small>}
                <strong>Dag {lesson.day} · {lesson.title}</strong>
                <span>{lesson.phase}{lesson.day === 1 && dayOne?.stars ? ' · ' : ''}{lesson.day === 1 && dayOne?.stars ? <Stars count={dayOne.stars} /> : null}</span>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

function Review({ progress }: { progress: ProgressState }) {
  const hasContent = progress.completedDays.includes(1);
  const reviewItems = [
    ['olá', 'hallo'],
    ['obrigado', 'bedankt'],
    ['português', 'Portugees'],
    ['Sou neerlandês.', 'Ik ben Nederlands.'],
    ['Como te chamas?', 'Hoe heet je?'],
  ];

  return (
    <main className="page review-page">
      <header className="page-header"><div><div className="eyebrow">SLIM HERHALEN</div><h1>Smart Review</h1></div></header>
      <p className="lead compact">Herhalen wordt opgebouwd uit woorden en chunks die je eerder hebt geleerd.</p>

      <section className="review-hero">
        <strong>{hasContent ? 5 : 0}</strong>
        <span>items klaar</span>
        <small>{hasContent ? 'Eerste reviewset · prototype' : 'Voltooi Dag 1 om items vrij te spelen'}</small>
        <div className="review-strengths">
          <span><i className="dot weak" /> actief ophalen</span>
          <span><i className="dot medium" /> luisteren</span>
          <span><i className="dot strong" /> herkennen</span>
        </div>
        <button className="primary-button" disabled={!hasContent}>{hasContent ? 'Smart Review komt in V0.3' : 'Nog geen review'}</button>
      </section>

      {hasContent && <section className="section-block">
        <div className="section-heading"><h3>Opgeslagen uit Dag 1</h3></div>
        <div className="review-list">
          {reviewItems.map(([portuguese, dutch], index) => (
            <div className="review-row" key={portuguese}>
              <i className={`dot ${index < 2 ? 'weak' : index < 4 ? 'medium' : 'strong'}`} />
              <div><strong>{portuguese}</strong><span>{dutch}</span></div>
            </div>
          ))}
        </div>
      </section>}
    </main>
  );
}

function Progress({ progress }: { progress: ProgressState }) {
  const completed = progress.completedDays.length;
  const percent = Math.round((completed / 30) * 100);
  const dayOne = progress.dayResults[1];

  return (
    <main className="page progress-page">
      <header className="page-header"><div><div className="eyebrow">O MEU PROGRESSO</div><h1>Je Portugees</h1></div></header>

      <section className="progress-overview">
        <div className="progress-ring dynamic-ring" style={{ '--progress': `${percent}%` } as React.CSSProperties}><span>{percent}%</span></div>
        <div><strong>{completed ? `Dag ${progress.currentDay} klaar om te bouwen` : 'Start bij Dag 1'}</strong><span>{completed ? 'Je voortgang wordt lokaal op dit apparaat bewaard.' : 'Je eerste les zet de tracker in beweging.'}</span></div>
      </section>

      <div className="stat-grid">
        <div><span>🔥</span><strong>{progress.streak}</strong><small>streak</small></div>
        <div><span>✦</span><strong>{progress.totalXp}</strong><small>XP</small></div>
        <div><span>⌁</span><strong>{progress.totalXp >= 100 ? 2 : 1}</strong><small>level</small></div>
      </div>

      <section className="section-block">
        <div className="section-heading"><h3>Echte voortgang</h3></div>
        <div className="mastery-card">
          <div><span className="mastery-dot active" /><strong>{progress.learnedWords.length}</strong><small>Woorden geleerd</small></div>
          <div><span className="mastery-dot produced" /><strong>{progress.learnedChunks.length}</strong><small>Chunks geleerd</small></div>
          <div><span className="mastery-dot remembered" /><strong>{completed}</strong><small>Lessen voltooid</small></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Dagresultaten</h3></div>
        {dayOne ? <div className="result-history-card"><div><strong>Dag 1</strong><span>Begroeten & voorstellen</span></div><div><b>{dayOne.score}%</b><Stars count={dayOne.stars} /></div></div> : <div className="empty-state">Nog geen resultaten. Begin met Dag 1.</div>}
      </section>

      <div className="progress-links">
        <button>🇵🇹 <span><strong>Portugees paspoort</strong><small>{completed ? 'Eerste stempel komt bij Dag 5' : 'Nog geen stempels'}</small></span><b>›</b></button>
        <button>⌘ <span><strong>Achievements</strong><small>{completed ? 'Primeiras Palavras ontgrendeld' : 'Begin met leren om achievements te verdienen'}</small></span><b>›</b></button>
      </div>
    </main>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [lessonOpen, setLessonOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());

  if (lessonOpen) return <LessonOverlay onClose={() => setLessonOpen(false)} onComplete={setProgress} />;

  return (
    <div className="app-shell">
      {tab === 'home' && <Home progress={progress} onStartLesson={() => setLessonOpen(true)} onGoReview={() => setTab('review')} />}
      {tab === 'learn' && <Learn progress={progress} onStartLesson={() => setLessonOpen(true)} />}
      {tab === 'review' && <Review progress={progress} />}
      {tab === 'progress' && <Progress progress={progress} />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
