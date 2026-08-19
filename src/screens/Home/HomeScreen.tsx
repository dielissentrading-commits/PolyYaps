import { TopBar } from '@/components/layout/TopBar';
import { DailyLessonCard } from '@/components/cards/DailyLessonCard';
import { ActionCard } from '@/components/cards/ActionCard';
import { Icon } from '@/components/ui/Icon';
import { StreakIndicator, XPIndicator } from '@/components/gamification/Indicators';
import { ProgressBar } from '@/components/progress/ProgressBar';
import { course } from '@/content/pt-PT/course';
import { useProgress } from '@/hooks/useProgress';
import { Link } from 'react-router-dom';
import './HomeScreen.css';

export function HomeScreen() {
  const { user, review, todayLesson, completionPercentage, levelTitle } = useProgress();

  return (
    <>
      <TopBar
        brand
        action={
          <Link to="/settings" className="home__settings" aria-label="Instellingen">
            <Icon name="settings" size={22} />
          </Link>
        }
      />

      <div className="page">
        <section className="home__greeting">
          <h1 className="home__greeting-title">Bom dia!</h1>
          <p className="home__greeting-sub muted">
            Nog {course.totalDays - user.currentDay + 1} dagen tot je eindgesprek.
          </p>
        </section>

        <section className="home__stats">
          <StreakIndicator days={user.streak} />
          <XPIndicator xp={user.totalXP} />
          <span className="chip">
            Level {user.level} · {levelTitle}
          </span>
        </section>

        <section className="section--tight">
          {todayLesson ? (
            <DailyLessonCard lesson={todayLesson} totalDays={course.totalDays} />
          ) : (
            <div className="placeholder">
              <span className="placeholder__title">Cursus afgerond</span>
              Alle 30 dagen zijn voltooid. Smart Review houdt je Portugees op peil.
            </div>
          )}
        </section>

        <section className="section stack--4 stack">
          <ActionCard
            to="/review"
            icon="review"
            tone="primary"
            title="Smart Review"
            description={`${review.dueCount} items klaar · ± ${review.estimatedMinutes} min`}
            badge={String(review.dueCount)}
          />

          {review.focusLabel && (
            <ActionCard
              to="/review"
              icon="sparkle"
              title={`Focus vandaag: ${review.focusLabel}`}
              description={review.focusHint ?? 'Extra oefening op je zwakste categorie.'}
            />
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="eyebrow">Jouw 30 dagen</h2>
            <Link to="/learn" className="home__link small">
              Bekijk pad
            </Link>
          </div>
          <div className="card home__course-card">
            <div className="home__course-head">
              <span className="home__course-day">
                Dag {user.currentDay} / {course.totalDays}
              </span>
              <span className="muted small">{completionPercentage}% voltooid</span>
            </div>
            <ProgressBar value={completionPercentage} label="Cursusvoortgang" />
          </div>
        </section>
      </div>
    </>
  );
}
