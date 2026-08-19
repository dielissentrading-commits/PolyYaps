import './SplashScreen.css';

/**
 * Shown while stored progress is being read.
 *
 * Without this, screens render against empty progress for a frame and can act
 * on it — a deep link into Smart Review would decide there was nothing due and
 * bounce back before the queue had loaded.
 */
export function SplashScreen() {
  return (
    <div className="splash">
      <span className="splash__wordmark">
        Poly<span className="splash__accent">Yaps</span>
      </span>
      <span className="visually-hidden">Bezig met laden</span>
    </div>
  );
}
