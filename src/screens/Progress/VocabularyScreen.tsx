import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/cards/StatCard';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { useProgress } from '@/hooks/useProgress';
import './VocabularyScreen.css';

/** The five mastery levels from docs/07-technical-architecture.md, section 9. */
const MASTERY_LEVELS = [
  { level: 0, label: 'Nieuw', count: 31 },
  { level: 1, label: 'Herkend', count: 24 },
  { level: 2, label: 'Herinnerd', count: 22 },
  { level: 3, label: 'Geproduceerd', count: 36 },
  { level: 4, label: 'Actief', count: 25 },
];

export function VocabularyScreen() {
  const { vocabulary } = useProgress();
  const total = MASTERY_LEVELS.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <>
      <TopBar title="Woordenschat" showBack backTo="/progress" />

      <div className="page">
        <section className="vocabulary__stats">
          <StatCard label="Woorden geleerd" value={vocabulary.itemsIntroduced} />
          <StatCard label="Woorden actief" value={vocabulary.itemsActive} />
          <StatCard label="Chunks geleerd" value={vocabulary.chunksIntroduced} />
          <StatCard label="Chunks actief" value={vocabulary.chunksActive} />
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="eyebrow">Mastery-verdeling</h2>
          </div>
          <div className="card vocabulary__mastery">
            {MASTERY_LEVELS.map((entry) => (
              <div className="vocabulary__level" key={entry.level}>
                <div className="vocabulary__level-head">
                  <span className="vocabulary__level-label">
                    <span className="vocabulary__level-index">{entry.level}</span>
                    {entry.label}
                  </span>
                  <span className="muted small">{entry.count}</span>
                </div>
                <ProgressBar
                  value={(entry.count / total) * 100}
                  label={entry.label}
                  size="thin"
                  tone={entry.level >= 3 ? 'success' : 'primary'}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="placeholder">
            <span className="placeholder__title">Itemlijst volgt in V0.4</span>
            Zodra mastery en strength per item worden bijgehouden, staat hier de doorzoekbare
            lijst met woorden en chunks.
          </div>
        </section>
      </div>
    </>
  );
}
