import { TopBar } from '@/components/layout/TopBar';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { useProgress } from '@/hooks/useProgress';
import './AchievementsScreen.css';

export function AchievementsScreen() {
  const { achievements, achievementProgress } = useProgress();
  const unlocked = achievementProgress.filter((entry) => entry.unlocked).length;

  return (
    <>
      <TopBar
        title="Achievements"
        subtitle={`${unlocked} van ${achievements.length} ontgrendeld`}
        showBack
        backTo="/progress"
      />

      <div className="page">
        <ul className="stack--4 stack">
          {achievements.map((achievement) => {
            const progress = achievementProgress.find(
              (entry) => entry.achievementId === achievement.id,
            );
            const isUnlocked = progress?.unlocked ?? false;

            return (
              <li key={achievement.id}>
                <div className={isUnlocked ? 'achievement achievement--unlocked' : 'achievement'}>
                  <span className="achievement__icon" aria-hidden="true">
                    {achievement.icon}
                  </span>
                  <div className="achievement__body">
                    <span className="achievement__title">{achievement.title}</span>
                    <span className="achievement__description">{achievement.description}</span>
                    {!isUnlocked && (progress?.progress ?? 0) > 0 && (
                      <div className="achievement__progress">
                        <ProgressBar
                          value={progress?.progress ?? 0}
                          label={achievement.title}
                          size="thin"
                        />
                        <span className="achievement__percentage">{progress?.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
