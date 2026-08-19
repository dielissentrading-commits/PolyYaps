import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { LessonOverlay } from './components/LessonOverlay';
import { lessons, reviewItems, skills } from './data/mockData';

type Tab = 'home' | 'learn' | 'review' | 'progress';

function Stars({ count = 0 }: { count?: number }) {
  return <span className="stars" aria-label={`${count} sterren`}>{'★'.repeat(count)}{'☆'.repeat(Math.max(0, 3 - count))}</span>;
}

function Home({ onStartLesson, onGoReview }: { onStartLesson: () => void; onGoReview: () => void }) {
  return (
    <main className="page home-page">
      <header className="brand-row">
        <div className="wordmark">Poly<span>Yaps</span></div>
        <button className="icon-button small" aria-label="Instellingen">···</button>
      </header>

      <section className="greeting">
        <h1>Boa tarde, Duran</h1>
        <p>Klaar voor je Portugese les?</p>
      </section>

      <div className="stat-strip">
        <span>🔥 <strong>8 dagen</strong></span>
        <span>✦ <strong>780 XP</strong></span>
        <span>⌁ <strong>Level 3</strong></span>
      </div>

      <section className="daily-card">
        <div className="eyebrow">DAG 9 VAN 30</div>
        <h2>Mijn dagelijkse routine</h2>
        <p>Leer praten over je dag en langere antwoorden bouwen.</p>
        <div className="progress-line"><span style={{ width: '30%' }} /></div>
        <div className="card-meta"><span>0 van 60 minuten</span><strong>30%</strong></div>
        <button className="primary-button" onClick={onStartLesson}>Start les</button>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Vandaag</h3></div>
        <button className="action-card" onClick={onGoReview}>
          <span className="action-icon">↻</span>
          <span className="action-copy"><strong>Smart Review</strong><small>11 items · ±7 min</small></span>
          <span className="chevron">›</span>
        </button>
        <div className="focus-card">
          <span className="action-icon">◎</span>
          <div className="action-copy"><small>Focus vandaag</small><strong>gostar de</strong><span>3 recente fouten</span></div>
        </div>
      </section>

      <section className="mini-mastery">
        <div><strong>112</strong><span>woorden</span></div>
        <div><strong>47</strong><span>chunks</span></div>
        <div><strong>28</strong><span>actief</span></div>
      </section>
    </main>
  );
}

function Learn({ onStartLesson }: { onStartLesson: () => void }) {
  return (
    <main className="page learn-page">
      <header className="page-header">
        <div><div className="eyebrow">30 DAGEN</div><h1>Je route door Portugal</h1></div>
        <span className="route-progress">8/30</span>
      </header>
      <p className="lead compact">Elke les brengt je dichter bij een gesprek dat echt bruikbaar voelt.</p>

      <section className="learning-path">
        {lessons.map((lesson, index) => {
          const isChallenge = lesson.day % 5 === 0;
          return (
            <div className="path-row" key={lesson.day}>
              <div className={`path-line ${index === lessons.length - 1 ? 'last' : ''}`} />
              <button
                className={`path-node ${lesson.status} ${isChallenge ? 'challenge' : ''}`}
                onClick={lesson.status === 'current' ? onStartLesson : undefined}
              >
                <span>{isChallenge ? '✦' : lesson.status === 'complete' || lesson.status === 'challenge' ? '✓' : lesson.day}</span>
              </button>
              <div className={`path-copy ${lesson.status}`}>
                {lesson.city && <small>{lesson.city.toUpperCase()}</small>}
                <strong>Dag {lesson.day} · {lesson.title}</strong>
                <span>{lesson.phase}{lesson.stars ? ' · ' : ''}{lesson.stars ? <Stars count={lesson.stars} /> : null}</span>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}

function Review() {
  return (
    <main className="page review-page">
      <header className="page-header">
        <div><div className="eyebrow">SLIM HERHALEN</div><h1>Smart Review</h1></div>
      </header>
      <p className="lead compact">PolyYaps kiest de items die vandaag de meeste aandacht verdienen.</p>

      <section className="review-hero">
        <strong>11</strong>
        <span>items klaar</span>
        <small>± 7 minuten</small>
        <div className="review-strengths">
          <span><i className="dot weak" /> 3 moeilijk</span>
          <span><i className="dot medium" /> 5 oefenen</span>
          <span><i className="dot strong" /> 3 sterk</span>
        </div>
        <button className="primary-button">Start review</button>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Voorbeelditems</h3></div>
        <div className="review-list">
          {reviewItems.map((item) => (
            <div className="review-row" key={item.portuguese}>
              <i className={`dot ${item.strength}`} />
              <div><strong>{item.portuguese}</strong><span>{item.dutch}</span></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Progress() {
  return (
    <main className="page progress-page">
      <header className="page-header">
        <div><div className="eyebrow">O MEU PROGRESSO</div><h1>Je Portugees</h1></div>
      </header>

      <section className="progress-overview">
        <div className="progress-ring" aria-label="40 procent voltooid"><span>40%</span></div>
        <div><strong>Dag 12 van 30</strong><span>Goed op weg naar je eindgesprek.</span></div>
      </section>

      <div className="stat-grid">
        <div><span>🔥</span><strong>12</strong><small>dagen</small></div>
        <div><span>✦</span><strong>1.180</strong><small>XP</small></div>
        <div><span>⌁</span><strong>4</strong><small>level</small></div>
      </div>

      <section className="section-block">
        <div className="section-heading"><h3>Mijn vaardigheden</h3></div>
        <div className="skill-list">
          {skills.map((skill) => (
            <div className="skill" key={skill.name}>
              <div><strong>{skill.name}</strong><span>{skill.value}%</span></div>
              <div className="skill-bar"><span style={{ width: `${skill.value}%` }} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading"><h3>Woordenschat</h3><span>157 geleerd</span></div>
        <div className="mastery-card">
          <div><span className="mastery-dot active" /><strong>22</strong><small>Actief</small></div>
          <div><span className="mastery-dot produced" /><strong>35</strong><small>Geproduceerd</small></div>
          <div><span className="mastery-dot remembered" /><strong>42</strong><small>Herinnerd</small></div>
        </div>
      </section>

      <div className="progress-links">
        <button>🇵🇹 <span><strong>Portugees paspoort</strong><small>2 van 8 stempels</small></span><b>›</b></button>
        <button>⌘ <span><strong>Achievements</strong><small>6 ontgrendeld</small></span><b>›</b></button>
      </div>
    </main>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [lessonOpen, setLessonOpen] = useState(false);

  if (lessonOpen) return <LessonOverlay onClose={() => setLessonOpen(false)} />;

  return (
    <div className="app-shell">
      {tab === 'home' && <Home onStartLesson={() => setLessonOpen(true)} onGoReview={() => setTab('review')} />}
      {tab === 'learn' && <Learn onStartLesson={() => setLessonOpen(true)} />}
      {tab === 'review' && <Review />}
      {tab === 'progress' && <Progress />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
