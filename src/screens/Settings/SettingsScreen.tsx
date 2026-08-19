import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { useProgress } from '@/hooks/useProgress';
import './SettingsScreen.css';

const APP_VERSION = '0.1.0';

export function SettingsScreen() {
  const { user, levelTitle } = useProgress();

  return (
    <>
      <TopBar title="Instellingen" showBack backTo="/" />

      <div className="page">
        <section className="card settings__profile">
          <span className="eyebrow">Jouw cursus</span>
          <h2 className="settings__course">Europees Portugees · pt-PT</h2>
          <p className="muted small">
            Dag {user.currentDay} · Level {user.level} ({levelTitle}) · {user.totalXP} XP
          </p>
        </section>

        <section className="section--tight">
          <div className="section-header">
            <h2 className="eyebrow">Voorkeuren</h2>
          </div>
          <div className="card settings__list">
            <SettingRow label="Dagelijkse herinnering" value="Nog niet beschikbaar" />
            <SettingRow label="Audio automatisch afspelen" value="Nog niet beschikbaar" />
            <SettingRow label="Microfoontoegang" value="Nog niet beschikbaar" />
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="eyebrow">Gegevens</h2>
          </div>
          <div className="stack">
            <Button variant="secondary" fullWidth disabled>
              Voortgang exporteren
            </Button>
            <Button variant="secondary" fullWidth disabled>
              Voortgang importeren
            </Button>
          </div>
          <p className="muted small settings__hint">
            Export en import komen zodra voortgang lokaal in IndexedDB wordt bewaard (V0.3).
          </p>
        </section>

        <p className="settings__version muted small">PolyYaps {APP_VERSION} · shell prototype</p>
      </div>
    </>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="settings__row">
      <span className="settings__row-label">{label}</span>
      <span className="settings__row-value muted small">{value}</span>
    </div>
  );
}
