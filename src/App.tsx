import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { LessonOverlay } from './components/LessonOverlay';
import { SmartReviewOverlay } from './components/SmartReviewOverlay';
import { CafeChallengeOverlay } from './components/CafeChallengeOverlay';
import { lessons } from './data/mockData';
import { getAvailableDays, getChallenge, getDayTitle, getLesson } from './data/lessonRegistry';
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
  weaknesses: [],
};

const weaknessLabels: Record<string, string> = {
  SER_VS_ESTAR: 'ser vs. estar',
  TER_AGE: 'ter voor leeftijd',
  TER_STATES: 'ter bij honger/dorst',
  QUERIA_REQUEST: 'beleefd bestellen',
  NUMBERS: 'getallen & prijzen',
  PAYMENT: 'betalen',
  TIME: 'tijd',
};

function weaknessLabel(category: string) {
  return weaknessLabels[category] ?? category.toLowerCase().replaceAll('_', ' ');
}

function Stars({ count = 0 }: { count?: number }) {
  return <span className="stars" aria-label={`${count} sterren`}>{'★'.repeat(count)}{'☆'.repeat(Math.max(0, 3 - count))}</span>;
}

function Home({ progress, review, onStartDay, onGoReview }: { progress: ProgressState; review: ReviewSnapshot; onStartDay: (day: number) => void; onGoReview: () => void }) {
  const availableDays = getAvailableDays();
  const maxAvailable = Math.max(...availableDays);
  const currentLesson = getLesson(progress.currentDay);
  const currentChallenge = getChallenge(progress.currentDay);
  const courseCaughtUp = progress.currentDay > maxAvailable || (!currentLesson && !currentChallenge);
  const fallbackDay = maxAvailable;
  const fallbackLesson = getLesson(fallbackDay);
  const fallbackChallenge = getChallenge(fallbackDay);
  const title = courseCaughtUp ? 'Dag 6 · Familie & relaties' : currentLesson?.title ?? currentChallenge?.title ?? fallbackLesson?.title ?? fallbackChallenge?.title ?? 'Volgende les';
  const goal = courseCaughtUp ? 'Dag 1–5 zijn volledig speelbaar. Dag 6 wordt de volgende contentrelease.' : currentLesson?.goal ?? currentChallenge?.goal ?? '';
  const isChallenge = Boolean(currentChallenge);
  const topWeakness = review.weaknesses[0];

  return (
    <main className="page home-page">
      <header className="brand-row">
        <div className="wordmark">Poly<span>Yaps</span></div>
        <button className="icon-button small" aria-label="Instellingen">···</button>
      </header>

      <section className="greeting">
        <h1>Olá, Duran</h1>
        <p>{courseCaughtUp ? 'Je hebt de eerste fase afgerond.' : isChallenge ? 'Vandaag test je wat je echt kunt gebruiken.' : `Klaar voor Dag ${progress.currentDay}?`}</p>
      </section>

      <div className="stat-strip">
        <span>🔥 <strong>{progress.streak} {progress.streak === 1 ? 'dag' : 'dagen'}</strong></span>
        <span>✦ <strong>{progress.totalXp} XP</strong></span>
        <span>⌁ <strong>Level {Math.max(1, Math.floor(progress.totalXp / 500) + 1)}</strong></span>
      </div>

      <section className={`daily-card ${isChallenge ? 'daily-challenge' : ''}`}>
        <div className="eyebrow">{courseCaughtUp ? 'VOLGENDE CONTENT' : isChallenge ? 'CHECKPOINT · LISBOA' : `DAG ${progress.currentDay} VAN 30`}</div>
        <h2>{title}</h2>
        <p>{goal}</p>
        <div className="progress-line"><span style={{ width: '0%' }} /></div>
        <div className="card-meta"><span>{courseCaughtUp ? 'Binnenkort speelbaar' : isChallenge ? '± 10 minuten · 150 XP' : '± 60 minuten'}</span><strong>{Math.round((progress.completedDays.length / 30) * 100)}% cursus</strong></div>
        <button className="primary-button" disabled={courseCaughtUp} onClick={() => onStartDay(progress.currentDay)}>{courseCaughtUp ? 'Dag 6 volgt' : isChallenge ? 'Start Café Challenge' : `Start Dag ${progress.currentDay}`}</button>
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
          <div className="action-copy"><small>{topWeakness ? 'Zwakste patroon' : 'Mastery'}</small><strong>{topWeakness ? weaknessLabel(topWeakness.category) : `${review.averageStrength}% gemiddelde sterkte`}</strong><span>{topWeakness ? `${topWeakness.averageStrength}% strength · ${topWeakness.count} items` : `${review.active} actief · ${review.weak} zwakke items`}</span></div>
        </div>
      </section>

      <section className="mini-mastery">
        <div><strong>{progress.learnedWords.length}</strong><span>woorden</span></div>
        <div><strong>{progress.learnedChunks.length}</strong><span>chunks</span></div>
        <div><strong>{progress.passportStamps.length}</strong><span>stempels</span></div>
      </section>
    </main>
  );
}

function Learn({ progress, onStartDay }: { progress: ProgressState; onStartDay: (day: number) => void }) {
  const available = new Set(getAvailableDays());
  return (
    <main className="page learn-page">
      <header className="page-header">
        <div><div className="eyebrow">30 DAGEN</div><h1>Je route door Portugal</h1></div>
        <span className="route-progress">{progress.completedDays.length}/30</span>
      </header>
      <p className="lead compact">De volledige Survival-fase is nu speelbaar: vier lessen en de eerste Café Challenge.</p>

      <section className="learning-path">
        {lessons.map((lesson, index) => {
          const completed = progress.completedDays.includes(lesson.day);
          const playable = available.has(lesson.day) && lesson.day <= progress.currentDay;
          const status = completed ? 'complete' : playable ? 'current' : 'upcoming';
          const isChallenge = lesson.day === 5;
          const stars = progress.dayResults[lesson.day]?.stars;
          return (
            <div className="path-row" key={lesson.day}>
              <div className={`path-line ${index === lessons.length - 1 ? 'last' : ''}`} />
              <button className={`path-node ${status} ${isChallenge ? 'challenge' : ''}`} onClick={playable || completed ? () => onStartDay(lesson.day) : undefined} aria-label={`Dag ${lesson.day}: ${lesson.title}`} disabled={!playable && !completed}>
                <span>{completed ? '✓' : isChallenge ? '☕' : lesson.day}</span>
              </button>
              <div className={`path-copy ${status}`}>
                {lesson.city && <small>{lesson.city.toUpperCase()}</small>}
                <strong>Dag {lesson.day} · {lesson.title}</strong>
                <span>{lesson.phase}{stars ? ' · ' : ''}{stars ? <Stars count={stars} /> : available.has(lesson.day) ? isChallenge ? ' · challenge' : ' · speelbaar' : ''}</span>
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
      <p className="lead compact">PolyYaps plant ieder item apart én groepeert fouten naar taalpatroon, zodat je ziet waarom iets lastig blijft.</p>

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

      {review.weaknesses.length > 0 && (
        <section className="section-block">
          <div className="section-heading"><h3>Patronen om op te letten</h3><span>laagste eerst</span></div>
          <div className="weakness-list">
            {review.weaknesses.slice(0, 5).map((weakness) => (
              <div className="weakness-row" key={weakness.category}>
                <div><strong>{weaknessLabel(weakness.category)}</strong><span>{weakness.count} gekoppelde items · {weakness.due} nu klaar</span></div>
                <b>{weakness.averageStrength}%</b>
              </div>
            ))}
          </div>
        </section>
      )}

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
  const topWeakness = review.weaknesses[0];
  return (
    <main className="page progress-page">
      <header className="page-header"><div><div className="eyebrow">O MEU PROGRESSO</div><h1>Je Portugees</h1></div></header>
      <section className="progress-overview"><div className="progress-ring dynamic-ring" style={{ '--progress': `${percent}%` } as React.CSSProperties}><span>{percent}%</span></div><div><strong>Dag {progress.currentDay} van 30</strong><span>{review.learned} items hebben een eigen mastery-record.</span></div></section>
      <div className="stat-grid"><div><span>🔥</span><strong>{progress.streak}</strong><small>streak</small></div><div><span>✦</span><strong>{progress.totalXp}</strong><small>XP</small></div><div><span>☕</span><strong>{progress.passportStamps.length}</strong><small>stempels</small></div></div>

      <section className="section-block"><div className="section-heading"><h3>Mastery</h3></div><div className="skill-list"><div className="skill"><div><strong>Actief beheerst</strong><span>{review.active}/{review.learned || 0}</span></div><div className="skill-bar"><span style={{ width: `${review.learned ? Math.round((review.active / review.learned) * 100) : 0}%` }} /></div></div><div className="skill"><div><strong>Gemiddelde strength</strong><span>{review.averageStrength}%</span></div><div className="skill-bar"><span style={{ width: `${review.averageStrength}%` }} /></div></div></div></section>

      {topWeakness && <section className="section-block"><div className="section-heading"><h3>Persoonlijke focus</h3></div><div className="personal-focus"><small>ZWAKSTE TAALPATROON</small><strong>{weaknessLabel(topWeakness.category)}</strong><span>{topWeakness.averageStrength}% strength over {topWeakness.count} items. Smart Review geeft deze items automatisch voorrang wanneer ze klaarstaan.</span></div></section>}

      <section className="section-block"><div className="section-heading"><h3>Dagresultaten</h3></div>{progress.completedDays.length ? <div className="review-list">{progress.completedDays.map((day) => <div className="review-row" key={day}><i className="dot strong" /><div><strong>Dag {day} · {getDayTitle(day)}</strong><span>{progress.dayResults[day]?.score}% · {progress.dayResults[day]?.xpEarned} XP</span></div></div>)}</div> : <div className="empty-state">Nog geen resultaten. Begin met Dag 1.</div>}</section>

      <div className="progress-links"><button>🇵🇹 <span><strong>Portugees paspoort</strong><small>{progress.passportStamps.length ? `${progress.passportStamps.length} stempel verdiend` : 'Eerste stempel bij Dag 5'}</small></span><b>›</b></button><button>⌘ <span><strong>Achievements</strong><small>{progress.achievements.length} ontgrendeld</small></span><b>›</b></button></div>
    </main>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress());
  const [review, setReview] = useState<ReviewSnapshot>(emptyReview);

  async function refreshReview() {
    try { setReview(await getReviewSnapshot()); } catch { setReview(emptyReview); }
  }

  useEffect(() => { void refreshReview(); }, [progress]);

  if (activeDay) {
    const challenge = getChallenge(activeDay);
    if (challenge) return <CafeChallengeOverlay onClose={() => setActiveDay(null)} onComplete={setProgress} onMasteryChanged={() => void refreshReview()} />;
    const lesson = getLesson(activeDay);
    if (lesson) return <LessonOverlay lesson={lesson} onClose={() => setActiveDay(null)} onComplete={setProgress} onMasteryChanged={() => void refreshReview()} />;
  }

  if (reviewOpen) return <SmartReviewOverlay onClose={() => setReviewOpen(false)} onChanged={() => void refreshReview()} />;

  return (
    <div className="app-shell">
      {tab === 'home' && <Home progress={progress} review={review} onStartDay={setActiveDay} onGoReview={() => setTab('review')} />}
      {tab === 'learn' && <Learn progress={progress} onStartDay={setActiveDay} />}
      {tab === 'review' && <Review review={review} onStartReview={() => setReviewOpen(true)} />}
      {tab === 'progress' && <Progress progress={progress} review={review} />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
