import { TopBar } from '@/components/layout/TopBar';
import { useProgress } from '@/hooks/useProgress';
import './PassportScreen.css';

/**
 * Passport — docs/06-app-design.md allows this screen to break slightly from
 * the core UI: warm cream surface, terracotta stamp accents, travel-document
 * feel.
 */
export function PassportScreen() {
  const { passportStamps } = useProgress();
  const earned = passportStamps.filter((stamp) => stamp.earned).length;

  return (
    <div className="passport">
      <TopBar title="Paspoort" showBack backTo="/progress" />

      <div className="page">
        <section className="passport__header">
          <span className="passport__country">República Portuguesa</span>
          <h2 className="passport__title">Passaporte de Português</h2>
          <p className="passport__meta">
            {earned} / {passportStamps.length} stempels · praktische scenario’s
          </p>
        </section>

        <ul className="passport__grid">
          {passportStamps.map((stamp) => (
            <li key={stamp.id}>
              <div className={stamp.earned ? 'stamp stamp--earned' : 'stamp'}>
                <span className="stamp__ring">
                  <span className="stamp__title">{stamp.title}</span>
                </span>
                <span className="stamp__scenario">{stamp.scenario}</span>
              </div>
            </li>
          ))}
        </ul>

        <p className="passport__note muted small">
          Je verdient een stempel door de dag af te ronden die het bijbehorende scenario leert.
        </p>
      </div>
    </div>
  );
}
