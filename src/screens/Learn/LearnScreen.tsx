import { TopBar } from '@/components/layout/TopBar';
import { DayCard, type DayState } from '@/components/cards/DayCard';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { course } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import './LearnScreen.css';

export function LearnScreen() {
  const { user, lessonProgressFor, completionPercentage } = useProgress();

  const phases = course.phases.map((phase) => ({
    ...phase,
    days: course.days.filter(
      (day) => day.day >= phase.dayRange[0] && day.day <= phase.dayRange[1],
    ),
  }));

  const stateFor = (day: number): DayState => {
    if (day < user.currentDay) return 'completed';
    if (day === user.currentDay) return 'current';
    return 'locked';
  };

  return (
    <>
      <TopBar title="Leerpad" subtitle={`Dag ${user.currentDay} van ${course.totalDays}`} />

      <div className="page">
        <div className="card learn__summary">
          <div className="learn__summary-head">
            <span className="learn__summary-value">{completionPercentage}%</span>
            <span className="muted small">
              {user.currentDay - 1} van {course.totalDays} dagen voltooid
            </span>
          </div>
          <ProgressBar value={completionPercentage} label="Cursusvoortgang" />
        </div>

        {phases.map((phase) => (
          <section className="section--tight learn__phase" key={`${phase.title}-${phase.dayRange[0]}`}>
            <div className="section-header">
              <h2 className="eyebrow">{phase.title}</h2>
              <span className="muted small">
                Dag {phase.dayRange[0]}–{phase.dayRange[1]}
              </span>
            </div>
            <ul className="stack">
              {phase.days.map((day) => (
                <li key={day.day}>
                  <DayCard
                    lesson={day}
                    state={stateFor(day.day)}
                    progress={lessonProgressFor(day.day)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
