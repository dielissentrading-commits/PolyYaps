import { achievementDetails, getLevel, getLevelProgress, getNextLevel, stampDetails } from '../lib/gamification';
import type { ProgressState } from '../lib/progress';

type Props = {
  mode: 'passport' | 'achievements';
  progress: ProgressState;
  onClose: () => void;
};

export function ProgressCollectionOverlay({ mode, progress, onClose }: Props) {
  const level = getLevel(progress.totalXp);
  const nextLevel = getNextLevel(progress.totalXp);
  const levelProgress = getLevelProgress(progress.totalXp);

  if (mode === 'passport') {
    const stamps = stampDetails(progress);
    return (
      <section className="focus-shell collection-shell passport-shell">
        <header className="focus-header"><button className="icon-button" onClick={onClose}>×</button><span>Passaporte Português</span><span className="focus-count">{progress.passportStamps.length}/{stamps.length}</span></header>
        <main className="collection-page">
          <div className="passport-cover"><small>POLYYAPS</small><h1>Passaporte<br/>Português</h1><span>30 Day Journey</span></div>
          <div className="section-heading"><h3>Stempels</h3><span>{progress.passportStamps.length} verdiend</span></div>
          <div className="stamp-grid">
            {stamps.map((stamp) => <div className={`stamp-card ${stamp.unlocked ? 'unlocked' : 'locked'}`} key={stamp.id}><div className="stamp-mark">{stamp.unlocked ? stamp.icon : '·'}</div><small>{stamp.city.toUpperCase()}</small><strong>{stamp.title}</strong><span>Dag {stamp.day}</span></div>)}
          </div>
          <button className="primary-button" onClick={onClose}>Terug naar Progress</button>
        </main>
      </section>
    );
  }

  const items = achievementDetails(progress);
  return (
    <section className="focus-shell collection-shell">
      <header className="focus-header"><button className="icon-button" onClick={onClose}>×</button><span>Achievements</span><span className="focus-count">{progress.achievements.length}/{items.length}</span></header>
      <main className="collection-page">
        <section className="level-card">
          <div><small>LEVEL {level.level}</small><h1>{level.name}</h1><span>{progress.totalXp} XP totaal</span></div>
          <div className="level-number">{level.level}</div>
          <div className="level-track"><span style={{ width: `${levelProgress}%` }} /></div>
          <p>{nextLevel ? `${nextLevel.minXp - progress.totalXp} XP tot ${nextLevel.name}` : 'Hoogste level bereikt.'}</p>
        </section>

        <div className="section-heading"><h3>Badges</h3><span>{progress.achievements.length} ontgrendeld</span></div>
        <div className="achievement-list">
          {items.map((achievement) => <div className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`} key={achievement.id}><div className="achievement-icon">{achievement.icon}</div><div><strong>{achievement.title}</strong><span>{achievement.description}</span></div><b>{achievement.unlocked ? '✓' : '○'}</b></div>)}
        </div>

        <div className="freeze-card"><span>❄</span><div><strong>{progress.streakFreezes} streak freeze{progress.streakFreezes === 1 ? '' : 's'}</strong><small>Je verdient er één bij iedere nieuwe 5-daagse streakmijlpaal, maximaal twee op voorraad.</small></div></div>
        <button className="primary-button" onClick={onClose}>Terug naar Progress</button>
      </main>
    </section>
  );
}
