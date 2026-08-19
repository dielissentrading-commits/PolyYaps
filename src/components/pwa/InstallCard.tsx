import { useInstallPrompt } from '@/pwa/useInstallPrompt';
import { Button } from '@/components/ui/Button';
import './InstallCard.css';

/**
 * Offers installing PolyYaps to the home screen, which is how the app is meant
 * to be used. Shows nothing once installed, and nothing in browsers that
 * neither prompt nor support the iOS route.
 */
export function InstallCard() {
  const { installed, canPrompt, needsManualInstall, install } = useInstallPrompt();

  if (installed || (!canPrompt && !needsManualInstall)) return null;

  return (
    <div className="install-card">
      <div className="install-card__text">
        <strong className="install-card__title">Zet PolyYaps op je beginscherm</strong>
        <span className="muted small">
          {canPrompt
            ? 'Dan opent hij als een app en werkt hij ook zonder internet.'
            : 'Tik op Deel en kies “Zet op beginscherm”.'}
        </span>
      </div>
      {canPrompt && (
        <Button variant="secondary" onClick={() => void install()}>
          Installeren
        </Button>
      )}
    </div>
  );
}
