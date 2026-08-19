import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { useProgress } from '@/hooks/useProgress';
import './SettingsScreen.css';

const APP_VERSION = '0.1.0';

export function SettingsScreen() {
  const { user, levelTitle, persistent, resetProgress } = useProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);

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
            <SettingRow
              label="Voortgang bewaren"
              value={persistent ? 'Op dit apparaat' : 'Niet mogelijk in deze browser'}
            />
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
            Export en import volgen. Je voortgang staat lokaal op dit apparaat en wordt nergens
            heen gestuurd.
          </p>

          <div className="stack settings__danger">
            {confirmingReset ? (
              <>
                <p className="muted small">
                  Dit wist je voortgang, mastery, XP en streak definitief.
                </p>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    void resetProgress();
                    setConfirmingReset(false);
                  }}
                >
                  Ja, wis alles
                </Button>
                <Button variant="text" onClick={() => setConfirmingReset(false)}>
                  Annuleren
                </Button>
              </>
            ) : (
              <Button variant="text" onClick={() => setConfirmingReset(true)}>
                Voortgang wissen
              </Button>
            )}
          </div>
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
