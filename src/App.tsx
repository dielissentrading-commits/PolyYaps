import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { LessonOverlay } from './components/LessonOverlay';
import { SmartReviewOverlay } from './components/SmartReviewOverlay';
import { lessons } from './data/mockData';
import { getAvailableDays, getLesson } from './data/lessonRegistry';
import { getReviewSnapshot } from './lib/learningDb';
import { loadProgress, type ProgressState } from './lib/progress';

type Tab = 'home' | 'learn' | 'review' | 'progress';
type ReviewSnapshot = Awaited<ReturnType<typeof getReviewSnapshot>>;

const emptyReview: ReviewSnapshot = {
  learned: 0,
  due: 0,
  weak: 0,
  attention: 0,
  strong: 0,
  active: 0,
  averageStrength: 0,
};

function Stars({ count = 0 }: { count?: number }) {
  return <span className="stars" aria-label={`${count} sterren`}>{'★'.repeat(count)}{'☆'.repeat(Math.max(0, 3 - count))}</span>;
}

function Home({ progress, review, onStartLesson, onGoReview }: { progress: ProgressState; review: ReviewSnapshot; onStartLesson: (day: number) => void; onGoReview: () => void }) {
  const currentLesson = getLesson(progress.currentDay);
  const currentResult = progress.dayResults[progress.currentDay];
  const fallbackLesson = getLesson(Math.max(...getAvailableDays()));
  const courseCaughtUp = !currentLesson && progress.currentDay > Math.max(...getAvailableDays());
  const lesson = currentLesson ?? fallbackLesson;

  return (
    <main className="page home-page">
      <header className="brand-row">
        <div className="wordmark">Poly<span>Yaps</span></div>
        <button className="icon-button small" aria-label="Instellingen">···</button>
      </header>

      <section className="greeting">
        <h1>Olá, Duran</h1>
        <p>{courseCaughtUp ? 'Je bent bij met de speelbare lessen.' : `Klaar voor Dag ${progress.currentDay}?`}</p>
      </section>

      <div className="stat-strip">
        <span>🔥 <strong>{progress.streak} {progress.streak === 1 ? 'dag' : 'dagen'}</strong></span>
        <span>✦ <strong>{progress.totalXp} XP</strong></span>
        <span>⌁ <strong>Level {Math.max(1, Math.floor(progress.totalXp / 500) + 1)}</strong></span>
      </div>

      <section className="daily-card">
        <div className="eyebrow">{courseCaughtUp ? 'VOLGENDE CONTENT' : `DAG ${lesson.day} VAN 30`}</div>
        <h2>{courseCaughtUp ? 'Dag 3 · Hoe gaat het?' : lesson.title}</h2>
        <p>{courseCaughtUp ? 'Dag 1 en 2 zijn volledig speelbaar. Dag 3 wordt de volgende les die we op deze engine zetten.' : lesson.goal}</p>
        <div className="progress-line"><span style={{ width: currentResult ? '100%' : '0%' }} /></div>
        <div className="card-meta"><span>{courseCaughtUp ? 'Binnenkort speelbaar' : '± 60 minuten'}</span><strong>{currentResult ? <Stars count={currentResult.stars} /> : `${Math.round((progress.completedDays.length / 30) * 100)}% cursus`}</strong></div>
        <button className="primary-button" disabled={courseCaughtUp} onClick={() => onStartLesson(lesson.day)}>{courseCaughtUp ? 'Dag 3 volgt' : `Start Dag ${lesson.day}`}</button>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Vandaag</h3></div>
        <button className="action-card" onClick={onGoReview}>
          <span className="action-icon">↻</span>
          <span className="action-copy"><strong>Smart Review</strong><small>{review.due ? `${review.due} items klaar · zwakste eerst` : review.learned ? 'Alles bijgewerkt · review wordt automatisch gepland' : 'Wordt actief tijdens je eerste les'}</small></span>
          <span className="chevron">›</span>
        </button>
        <div className="focus-card">
          <span className="action-icon">◎</span>
          <div className="action-copy"><small>Mastery</small><strong>{review.averageStrength}% gemiddelde sterkte</strong><span>{review.active} actief · {review.weak} zwakke items</span></div>
        </div>
      </section>

      <section className="mini-mastery">
        <div><strong>{progress.learnedWords.length}</strong><span>woorden</span></div>
        <div><strong>{progress.learnedChunks.length}</strong><span>chunks</span></div>
        <div><strong>{review.active}</strong><span>actief</span></div>
      </section>
    </main>
  );
}

function Learn({ progress, onStartLesson }: { progress: ProgressState; onStartLesson: (day: number) => void }) {
  const available = new Set(getAvailableDays());
  return (
    <main className="page learn-page">
      <header className="page-header">
        <div><div className="eyebrow">30 DAGEN</div><h1>Je route door Portugal</h1></div>
        <span className="route-progress">{progress.completedDays.length}/30</span>
      </header>
      <p className="lead compact">Dag 1 en 2 gebruiken nu dezelfde learning engine. Nieuwe dagen kunnen als content worden toegevoegd zonder nieuwe les-UI te bouwen.</p>

      <section className="learning-path">
        {lessons.map((lesson, index) => {
          const completed = progress.completedDays.includes(lesson.day);
          const playable = available.has(lesson.day) && lesson.day <= progress.currentDay;
          const status = completed ? 'complete' : playable ? 'current' : 'upcoming';
          const isChallenge = lesson.day % 5 === 0;
          const stars = progress.dayResults[lesson.day]?.stars;
          return (
            <div className="path-row" key={lesson.day}>
              <div className={`path-line ${index === lessons.length - 1 ? 'last' : ''}`} />
              <button className={`path-node ${status} ${isChallenge ? 'challenge' : ''}`} onClick={playable || completed ? () => onStartLesson(lesson.day) : undefined} aria-label={`Dag ${lesson.day}: ${lesson.title}`} disabled={!playable && !completed}>
                <span>{completed ? '✓' : isChallenge ? '✦' : lesson.day}</span>
              </button>
              <div className={`path-copy ${status}`}>
                {lesson.city && <small>{lesson.city.toUpperCase()}</small>}
                <strong>Dag {lesson.day} · {lesson.title}</strong>
                <span>{lesson.phase}{stars ? ' · ' : ''}{stars ? <Stars count={stars} /> : available.has(lesson.day) ? ' · speelbaar' : ''}</span>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

function Review({ review, onStartReview }: { review: ReviewSnapshot; onStartReview: () => void }) {
  return (
    <main className="page review-page">
      <header className="page-header"><div><div className="eyebrow">SLIM HERHALEN</div><h1>Smart Review</h1></div></header>
      <p className="lead compact">PolyYaps plant ieder woord en iedere chunk apart. Fouten komen sneller terug; sterke items krijgen meer ruimte.</p>

      <section className="review-hero">
        <strong>{review.due}</strong>
        <span>items klaar</span>
        <small>{review.due ? 'Gesorteerd op laagste strength en reviewdatum' : review.learned ? 'Geen review nodig op dit moment' : 'Voltooi een les om mastery op te bouwen'}</small>
        <div className="review-strengths">
          <span><i className="dot weak" /> {review.weak} zwak</span>
          <span><i className="dot medium" /> {review.attention} aandacht</span>
          <span><i className="dot strong" /> {review.strong} sterk</span>
        </div>
        <button className="primary-button" disabled={!review.learned} onClick={onStartReview}>{review.due ? 'Start Smart Review' : review.learned ? 'Bekijk reviewstatus' : 'Nog geen review'}</button>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Mastery-overzicht</h3><span>{review.learned} items</span></div>
        <div className="mastery-card">
          <div><span className="mastery-dot active" /><strong>{review.active}</strong><small>Actief</small></div>
          <div><span className="mastery-dot produced" /><strong>{review.averageStrength}%</strong><small>Gem. strength</small></div>
          <div><span className="mastery-dot remembered" /><strong>{review.due}</strong><small>Nu herhalen</small></div>
        </div>
      </section>
    </main>
  );
}

function Progress({ progress, review }: { progress: ProgressState; review: ReviewSnapshot }) {
  const completed = progress.completedDays.length;
  const percent = Math.round((completed / 30) * 100);
  return (
    <main className="page progress-page">
      <header className="page-header"><div><div className="eyebrow">O MEU PROGRESSO</div><h1>Je Portugees</h1></div></header>
      <section className="progress-overview"><div className="progress-ring dynamic-ring" style={{ '--progress': `${percent}%` } as React.CSSProperties}><span>{percent}%</span></div><div><strong>Dag {progress.currentDay} van 30</strong><span>{review.learned} items hebben nu een eigen mastery-record.</span></div></section>
      <div className="stat-grid"><div><span>🔥</span><strong>{progress.streak}</strong><small>streak</small></div><div><span>✦</span><strong>{progress.totalXp}</strong><small>XP</small></div><div><span>◎</span><strong>{review.averageStrength}</strong><small>strength</small></div></div>

      <section className="section-block"><div className="section-heading"><h3>Mastery</h3></div><div className="skill-list"><div className="skill"><div><strong>Actief beheerst</strong><span>{review.active}/{review.learned || 0}</span></div><div className="skill-bar"><span style={{ width: `${review.learned ? Math.round((review.active / review.learned) * 100) : 0}%` }} /></div></div><div className="skill"><div><strong>Gemiddelde strength</strong><span>{review.averageStrength}%</span></div><div className="skill-bar"><span style={{ width: `${review.averageStrength}%` }} /></div></div></div></section>

      <section className="section-block"><div className="section-heading"><h3>Dagresultaten</h3></div>{progress.completedDays.length ? <div className="review-list">{progress.completedDays.map((day) => <div className="review-row" key={day}><i className="dot strong" /><div><strong>Dag {day} · {getLesson(day)?.title ?? 'Les'}</strong><span>{progress.dayResults[day]?.score}% · {progress.dayResults[day]?.xpEarned} XP</span></div></div>)}</div> : <div className="empty-state">Nog geen resultaten. Begin met Dag 1.</div>}</section>

      <div className="progress-links"><button>🇵🇹 <span><strong>Portugees paspoort</strong><small>Eerste stempel bij Dag 5</small></span><b>›</b></button><button>⌘ <span><strong>Achievements</strong><small>{completed ? 'Primeiras Palavras ontgrendeld' : 'Begin met leren om achievements te verdienen'}</small></span><b>›</b></button></div>
    </main>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [lessonDay, setLessonDay] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [review, setReview] = useState<ReviewSnapshot>(emptyReview);

  async function refreshReview() {
    try { setReview(await getReviewSnapshot()); } catch { setReview(emptyReview); }
  }

  useEffect(() => { void refreshReview(); }, [progress]);

  if (lessonDay) {
    const lesson = getLesson(lessonDay);
    if (lesson) return <LessonOverlay lesson={lesson} onClose={() => setLessonDay(null)} onComplete={setProgress} onMasteryChanged={() => void refreshReview()} />;
  }

  if (reviewOpen) return <SmartReviewOverlay onClose={() => setReviewOpen(false)} onChanged={() => void refreshReview()} />;

  return (
    <div className="app-shell">
      {tab === 'home' && <Home progress={progress} review={review} onStartLesson={setLessonDay} onGoReview={() => setTab('review')} />}
      {tab === 'learn' && <Learn progress={progress} onStartLesson={setLessonDay} />}
      {tab === 'review' && <Review review={review} onStartReview={() => setReviewOpen(true)} />}
      {tab === 'progress' && <Progress progress={progress} review={review} />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
