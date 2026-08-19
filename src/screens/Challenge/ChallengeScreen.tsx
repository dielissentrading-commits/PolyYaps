import { Navigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { course, getChallengeTitle, getPhaseTitle } from '@/content/pt-PT/course';
import './ChallengeScreen.css';

/**
 * Boss challenge shell — checkpoint days replace the normal module sequence
 * with a challenge flow (docs/07-technical-architecture.md, section 6).
 */
export function ChallengeScreen() {
  const { id } = useParams();
  const title = id ? getChallengeTitle(id) : undefined;
  const day = course.days.find((entry) => entry.challengeId === id);

  if (!title || !day) {
    return <Navigate to="/learn" replace />;
  }

  return (
    <FocusShell
      title={`Dag ${day.day} · Challenge`}
      closeTo="/learn"
      footer={
        <ButtonLink
          to={`/lesson/${day.day}/result`}
          fullWidth
          trailing={<Icon name="chevron-right" size={20} />}
        >
          Start challenge
        </ButtonLink>
      }
    >
      <div className="challenge">
        <div className="challenge__hero">
          <span className="challenge__eyebrow">{getPhaseTitle(day.day)}</span>
          <h1 className="challenge__title">{title}</h1>
          <p className="challenge__description">{day.description}</p>
        </div>

        <div className="challenge__rewards">
          <span className="chip chip--primary">Bonus XP</span>
          <span className="chip">Paspoortstempel</span>
          <span className="chip">Tot 3 sterren</span>
        </div>

        <ol className="challenge__steps">
          <li className="challenge__step">
            <span className="challenge__step-index">1</span>
            <span>Warm-up in het Portugees</span>
          </li>
          <li className="challenge__step">
            <span className="challenge__step-index">2</span>
            <span>Scenario spelen zonder Engels</span>
          </li>
          <li className="challenge__step">
            <span className="challenge__step-index">3</span>
            <span>Feedback op maximaal drie fouten</span>
          </li>
          <li className="challenge__step">
            <span className="challenge__step-index">4</span>
            <span>Retry en beloning</span>
          </li>
        </ol>

        <div className="placeholder challenge__note">
          <span className="placeholder__title">Challenge-flow volgt later</span>
          Scenario’s worden data-driven (V0.8). Deze shell toont alleen opbouw en beloningen.
        </div>
      </div>
    </FocusShell>
  );
}
