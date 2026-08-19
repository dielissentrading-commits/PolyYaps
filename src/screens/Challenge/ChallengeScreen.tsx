import { Navigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { course, getChallengeTask, getChallengeTitle } from '@/content/pt-PT/course';
import './ChallengeScreen.css';

/**
 * Boss challenge — checkpoint days replace the normal module sequence with a
 * challenge flow (docs/07-technical-architecture.md, section 6). The steps come
 * from the day's Checkpoint section in the editorial content.
 */
export function ChallengeScreen() {
  const { id } = useParams();
  const title = id ? getChallengeTitle(id) : undefined;
  const day = course.days.find((entry) => entry.challengeId === id);

  if (!title || !day) {
    return <Navigate to="/learn" replace />;
  }

  const task = getChallengeTask(day);

  return (
    <FocusShell
      title={`Dag ${day.day} · Challenge`}
      closeTo="/learn"
      footer={
        <ButtonLink
          to={`/lesson/${day.day}`}
          fullWidth
          trailing={<Icon name="chevron-right" size={20} />}
        >
          Start challenge
        </ButtonLink>
      }
    >
      <div className="challenge">
        <div className="challenge__hero">
          <span className="challenge__eyebrow">{day.phaseTitle}</span>
          <h1 className="challenge__title">{title}</h1>
          <p className="challenge__description">{day.goal}</p>
        </div>

        <div className="challenge__rewards">
          <span className="chip chip--primary">Bonus XP</span>
          <span className="chip">Paspoortstempel</span>
          <span className="chip">Tot 3 sterren</span>
        </div>

        {task && (
          <section className="challenge__task">
            <h2 className="eyebrow">{task.body[0] ?? 'Wat je moet doen'}</h2>
            <ol className="challenge__steps">
              {task.steps.map((step, index) => (
                <li className="challenge__step" key={step}>
                  <span className="challenge__step-index">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <p className="challenge__note muted small">
          Je doorloopt de dag zoals een gewone les; de checkpoint weegt spreken en praktijk
          zwaarder mee in je dagscore.
        </p>
      </div>
    </FocusShell>
  );
}
