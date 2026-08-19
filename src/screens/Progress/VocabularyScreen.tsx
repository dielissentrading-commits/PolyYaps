import { useMemo } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/cards/StatCard';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { MASTERY_LABELS } from '@/engine/mastery';
import { getItem } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import type { MasteryLevel } from '@/types';
import './VocabularyScreen.css';

const LEVELS: MasteryLevel[] = [0, 1, 2, 3, 4];

export function VocabularyScreen() {
  const { vocabulary, items } = useProgress();

  const { distribution, total, strongest } = useMemo(() => {
    const tracked = Object.values(items);
    const counts = new Map<MasteryLevel, number>(LEVELS.map((level) => [level, 0]));

    for (const item of tracked) {
      counts.set(item.masteryLevel, (counts.get(item.masteryLevel) ?? 0) + 1);
    }

    return {
      distribution: LEVELS.map((level) => ({
        level,
        label: MASTERY_LABELS[level],
        count: counts.get(level) ?? 0,
      })),
      total: tracked.length,
      strongest: [...tracked]
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 8)
        .map((entry) => ({ progress: entry, item: getItem(entry.itemId) }))
        .filter((entry) => entry.item),
    };
  }, [items]);

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
            <span className="muted small">{total} items</span>
          </div>

          {total === 0 ? (
            <div className="placeholder">
              <span className="placeholder__title">Nog niets geoefend</span>
              Zodra je een les doet, verschijnt hier hoe goed je elk woord beheerst.
            </div>
          ) : (
            <div className="card vocabulary__mastery">
              {distribution.map((entry) => (
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
          )}
        </section>

        {strongest.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="eyebrow">Sterkste items</h2>
            </div>
            <ul className="stack vocabulary__items">
              {strongest.map(({ item, progress }) => (
                <li className="vocabulary__item" key={progress.itemId}>
                  <span className="vocabulary__item-text">
                    <strong lang="pt-PT">{item!.portuguese}</strong>
                    <span className="muted small">{item!.dutch}</span>
                  </span>
                  <span className="chip">{MASTERY_LABELS[progress.masteryLevel]}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
