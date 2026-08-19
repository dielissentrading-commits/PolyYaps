import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FocusShell } from '@/components/layout/FocusShell';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getDay } from '@/content/pt-PT/course';
import { LESSON_MODULES, getModuleDefinition } from '@/content/pt-PT/modules';
import './ModuleScreen.css';

/** Placeholder item count per module so the progress bar behaves realistically. */
const ITEMS_PER_MODULE = 5;

/**
 * Lesson player shell — docs/06-app-design.md, "Lesson player".
 *
 * V0.1 has no exercises yet: it establishes the focus-mode frame, the item
 * counter, the progress bar and the one dominant continuation action. V0.2
 * replaces the placeholder body with Flashcard / AnswerInput / listening and
 * speaking components driven by real learning items.
 */
export function ModuleScreen() {
  const { day, module } = useParams();
  const navigate = useNavigate();

  const dayNumber = Number(day);
  const lesson = Number.isFinite(dayNumber) ? getDay(dayNumber) : undefined;
  const definition = module ? getModuleDefinition(module) : undefined;

  const [step, setStep] = useState(1);

  // Moving to another module restarts the counter.
  useEffect(() => {
    setStep(1);
  }, [module]);

  if (!lesson || !definition) {
    return <Navigate to="/learn" replace />;
  }

  const moduleIndex = LESSON_MODULES.findIndex((entry) => entry.type === definition.type);
  const nextModule = LESSON_MODULES[moduleIndex + 1];
  const isLastStep = step >= ITEMS_PER_MODULE;

  const advance = () => {
    if (!isLastStep) {
      setStep((current) => current + 1);
      return;
    }
    if (nextModule) {
      navigate(`/lesson/${lesson.day}/${nextModule.type}`);
    } else {
      navigate(`/lesson/${lesson.day}/result`);
    }
  };

  return (
    <FocusShell
      title={definition.label}
      step={step}
      totalSteps={ITEMS_PER_MODULE}
      closeTo={`/lesson/${lesson.day}`}
      footer={
        <Button fullWidth onClick={advance} trailing={<Icon name="chevron-right" size={20} />}>
          {isLastStep ? (nextModule ? `Verder naar ${nextModule.label}` : 'Naar resultaat') : 'Volgende'}
        </Button>
      }
    >
      <div className="module">
        <div className="module__target">
          <p className="module__prompt muted small">{definition.description}</p>
          <p className="module__portuguese" lang="pt-PT">
            Learning target
          </p>
          <p className="module__translation muted">Vertaling en context verschijnen hier</p>

          <button type="button" className="module__audio" disabled>
            <Icon name={definition.type === 'speaking' ? 'mic' : 'sound'} size={20} />
            <span>{definition.type === 'speaking' ? 'Opnemen' : 'Luister'}</span>
          </button>
        </div>

        <div className="placeholder module__note">
          <span className="placeholder__title">Module {moduleIndex + 1} van {LESSON_MODULES.length}</span>
          Deze module is nog een shell. De oefeningen, audio en feedbackstates komen in V0.2.
        </div>
      </div>
    </FocusShell>
  );
}
