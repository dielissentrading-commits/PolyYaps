import { useState } from 'react';
import { downloadBackup, importBackupText, resetAllLearningData } from '../lib/dataPortability';
import type { ProgressState } from '../lib/progress';

type Props = {
  onClose: () => void;
  onImported: (progress: ProgressState) => void;
};

export function SettingsOverlay({ onClose, onImported }: Props) {
  const [message, setMessage] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  async function importFile(file?: File) {
    if (!file) return;
    try {
      const progress = await importBackupText(await file.text());
      setMessage('Back-up geïmporteerd.');
      onImported(progress);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Importeren mislukt.');
    }
  }

  async function reset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await resetAllLearningData();
    window.location.reload();
  }

  return (
    <section className="focus-shell settings-shell">
      <header className="focus-header"><button className="icon-button" onClick={onClose}>×</button><span>Instellingen</span><span /></header>
      <main className="settings-page">
        <div className="settings-hero"><div className="wordmark">Poly<span>Yaps</span></div><h1>Jouw leerdata</h1><p>PolyYaps is local-first. Maak een back-up voordat je van apparaat wisselt of browserdata verwijdert.</p></div>

        <section className="settings-card">
          <small>BACK-UP</small>
          <h2>Exporteren</h2>
          <p>Download voortgang, XP, streaks en alle mastery-records als één JSON-bestand.</p>
          <button className="primary-button" onClick={() => void downloadBackup()}>Download back-up</button>
        </section>

        <section className="settings-card">
          <small>HERSTELLEN</small>
          <h2>Importeren</h2>
          <p>Kies een eerder geëxporteerde PolyYaps-back-up.</p>
          <label className="file-button">Kies back-up<input type="file" accept="application/json,.json" onChange={(event) => void importFile(event.target.files?.[0])} /></label>
        </section>

        <section className="settings-card install-card">
          <small>IPHONE</small>
          <h2>Zet PolyYaps op je beginscherm</h2>
          <p>Open de site in Safari, gebruik Delen en kies ‘Zet op beginscherm’. De app opent daarna als standalone webapp.</p>
        </section>

        <section className="settings-card danger-card">
          <small>RESET</small>
          <h2>Alle voortgang wissen</h2>
          <p>Verwijdert lokale cursusvoortgang én mastery. Dit kan niet ongedaan worden gemaakt zonder back-up.</p>
          <button className="secondary-button danger" onClick={() => void reset()}>{confirmReset ? 'Nogmaals: alles wissen' : 'Voortgang resetten'}</button>
        </section>
        {message && <div className="settings-message">{message}</div>}
      </main>
    </section>
  );
}
