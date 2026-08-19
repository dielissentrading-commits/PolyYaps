import { Navigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { ButtonLink } from '@/components/ui/Button';
import { Stars } from '@/components/gamification/Indicators';
import { SkillBar } from '@/components/progress/SkillBar';
import { getDay } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import './DailyResultScreen.css';

/**
 * Daily result — screen 9 in docs/06-app-design.md, section 6B.
 * V0.1 shows the layout with mock skill scores; V0.4 feeds it real ones.
 */
export function DailyResultScreen() {
  const { day } = useParams();
  const { skills, user } = useProgress();

  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;

  if (!lesson) {
    return <Navigate to="/learn" replace />;
  }

  return (
    <FocusShell
      title={`Dag ${lesson.day} voltooid`}
      closeTo="/"
      footer={
        <ButtonLink to="/" fullWidth>
          Terug naar home
        </ButtonLink>
      }
    >
      <div className="result">
        <div className="result__hero">
          <Stars count={2} />
          <p className="result__score">84%</p>
          <p className="muted small">Dagscore voor {lesson.title}</p>
        </div>

        <div className="result__rewards">
          <span className="chip chip--primary">+100 XP</span>
          <span className="chip">Streak {user.streak + 1}</span>
          <span className="chip">55 min</span>
        </div>

        <section className="section--tight">
          <h2 className="eyebrow">Vaardigheden vandaag</h2>
          <div className="stack--4 stack result__skills">
            {skills.slice(0, 4).map((skill) => (
              <SkillBar key={skill.key} label={skill.label} score={skill.score} />
            ))}
          </div>
        </section>

        <div className="placeholder result__note">
          <span className="placeholder__title">Nog mock data</span>
          Scores, XP en mastery worden echt zodra de scoring- en review-engine er zijn (V0.4–V0.5).
        </div>
      </div>
    </FocusShell>
  );
}
