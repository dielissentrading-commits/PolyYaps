import { TopBar } from '@/components/layout/TopBar';
import { StatCard } from '@/components/cards/StatCard';
import { ActionCard } from '@/components/cards/ActionCard';
import { SkillBar } from '@/components/progress/SkillBar';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { course } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import './ProgressScreen.css';

export function ProgressScreen() {
  const {
    user,
    levelTitle,
    skills,
    vocabulary,
    completionPercentage,
    passportStamps,
    achievementProgress,
  } = useProgress();

  const earnedStamps = passportStamps.filter((stamp) => stamp.earned).length;
  const unlockedAchievements = achievementProgress.filter((entry) => entry.unlocked).length;

  return (
    <>
      <TopBar title="Voortgang" subtitle={`Level ${user.level} · ${levelTitle}`} />

      <div className="page">
        <section className="card progress__overview">
          <div className="progress__overview-head">
            <span className="progress__overview-day">
              Dag {user.currentDay} / {course.totalDays}
            </span>
            <span className="muted small">{completionPercentage}% voltooid</span>
          </div>
          <ProgressBar value={completionPercentage} label="Cursusvoortgang" />
        </section>

        <section className="section--tight progress__stats">
          <StatCard label="Streak" value={`${user.streak}d`} hint={`Langste ${user.longestStreak}d`} />
          <StatCard label="XP" value={user.totalXP.toLocaleString('nl-NL')} hint={levelTitle} />
          <StatCard
            label="Actieve woorden"
            value={vocabulary.itemsActive}
            hint={`${vocabulary.itemsIntroduced} geleerd`}
          />
          <StatCard
            label="Leertijd"
            value={`${Math.round(user.totalLearningMinutes / 60)}u`}
            hint={`${user.totalLearningMinutes} minuten`}
          />
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="eyebrow">Vaardigheden</h2>
          </div>
          <div className="card progress__skills">
            {skills.map((skill) => (
              <SkillBar key={skill.key} label={skill.label} score={skill.score} />
            ))}
          </div>
        </section>

        <section className="section stack--4 stack">
          <ActionCard
            to="/progress/vocabulary"
            icon="sparkle"
            title="Woordenschat"
            description={`${vocabulary.itemsActive} actief · ${vocabulary.chunksActive} chunks`}
          />
          <ActionCard
            to="/passport"
            icon="passport"
            tone="success"
            title="Paspoort"
            description={`${earnedStamps} van ${passportStamps.length} stempels behaald`}
          />
          <ActionCard
            to="/achievements"
            icon="trophy"
            title="Achievements"
            description={`${unlockedAchievements} van ${achievementProgress.length} ontgrendeld`}
          />
        </section>
      </div>
    </>
  );
}
