import { useRef, useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { InstallCard } from '@/components/pwa/InstallCard';
import { useProgress } from '@/hooks/useProgress';
import {
  ImportError,
  exportFilename,
  exportProgress,
  importProgress,
  readExportFile,
} from '@/storage/exportImport';
import './SettingsScreen.css';

const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const { user, levelTitle, persistent, resetProgress, reload } = useProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [status, setStatus] = useState<{ tone: 'ok' | 'error'; message: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const download = async () => {
    const backup = await exportProgress();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = exportFilename();
    link.click();

    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    setStatus({ tone: 'ok', message: 'Back-up gedownload.' });
  };

  const upload = async (file: File) => {
    try {
      const backup = await readExportFile(file);
      await importProgress(backup);
      await reload();
      setStatus({ tone: 'ok', message: 'Voortgang hersteld uit de back-up.' });
    } catch (error) {
      setStatus({
        tone: 'error',
        message:
          error instanceof ImportError
            ? error.message
            : 'Het importeren is niet gelukt. Probeer een ander bestand.',
      });
    }
  };

  return (
    <>
      <TopBar title="Instellingen" showBack backTo="/" />

      <div className="page">
        <InstallCard />

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
            <SettingRow
              label="Voortgang bewaren"
              value={persistent ? 'Op dit apparaat' : 'Niet mogelijk in deze browser'}
            />
            <SettingRow label="Gegevens delen" value="Niets verlaat je apparaat" />
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2 className="eyebrow">Back-up</h2>
          </div>

          <div className="stack">
            <Button variant="secondary" fullWidth onClick={() => void download()}>
              Voortgang exporteren
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => fileInput.current?.click()}
            >
              Voortgang importeren
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              // Opened by the button above, so it stays out of the tab order.
              tabIndex={-1}
              aria-label="Kies een back-upbestand"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void upload(file);
              }}
            />
          </div>

          {status && (
            <p
              className={
                status.tone === 'error'
                  ? 'settings__status settings__status--error small'
                  : 'settings__status small'
              }
              role="status"
            >
              {status.message}
            </p>
          )}

          <p className="muted small settings__hint">
            Importeren vervangt je huidige voortgang volledig.
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
                    setStatus({ tone: 'ok', message: 'Voortgang gewist.' });
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

        <p className="settings__version muted small">PolyYaps {APP_VERSION}</p>
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
