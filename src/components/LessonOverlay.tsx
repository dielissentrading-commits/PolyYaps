type Props = {
  onClose: () => void;
};

const lessonSteps = [
  ['Review', '10 min', true],
  ['Woorden', '10 min', false],
  ['Chunks', '5 min', false],
  ['Luisteren', '10 min', false],
  ['Grammatica', '5 min', false],
  ['Spreken', '15 min', false],
  ['Dagtoets', '5 min', false],
] as const;

export function LessonOverlay({ onClose }: Props) {
  return (
    <section className="focus-shell" aria-label="Dag 9 les">
      <header className="focus-header">
        <button className="icon-button" onClick={onClose} aria-label="Les sluiten">×</button>
        <span>Dag 9</span>
        <span className="focus-count">10 / 60 min</span>
      </header>

      <div className="focus-progress"><span style={{ width: '17%' }} /></div>

      <main className="lesson-detail">
        <div className="eyebrow">DAG 9 VAN 30</div>
        <h1>Mijn dagelijkse routine</h1>
        <p className="lead">Leer vertellen hoe een normale dag eruitziet en bouw langere antwoorden.</p>

        <div className="lesson-mission">
          {lessonSteps.map(([label, time, done], index) => (
            <div className="mission-row" key={label}>
              <span className={`mission-status ${done ? 'done' : index === 1 ? 'current' : ''}`}>
                {done ? '✓' : index === 1 ? '→' : '○'}
              </span>
              <span className="mission-label">{label}</span>
              <span className="mission-time">{time}</span>
            </div>
          ))}
        </div>

        <div className="lesson-note">
          <span className="note-icon">🎯</span>
          <div>
            <strong>Focus vandaag</strong>
            <span>Volgorde aangeven met primeiro, depois en à noite.</span>
          </div>
        </div>
      </main>

      <footer className="focus-footer">
        <button className="primary-button" onClick={onClose}>Verder met les</button>
      </footer>
    </section>
  );
}
