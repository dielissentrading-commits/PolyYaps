import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import './FocusShell.css';

interface FocusShellProps {
  /** Module or challenge name shown next to the close button. */
  title: string;
  /** 1-based position in the module, used for the counter and progress bar. */
  step?: number;
  totalSteps?: number;
  /** Where the close button leads. */
  closeTo: string;
  children: ReactNode;
  /** The single dominant action for this screen. */
  footer?: ReactNode;
}

/**
 * Focus mode — docs/06-app-design.md, sections 6B and 6D.
 * No bottom navigation: only close, the module context and one continuation.
 */
export function FocusShell({
  title,
  step,
  totalSteps,
  closeTo,
  children,
  footer,
}: FocusShellProps) {
  const navigate = useNavigate();
  const hasCounter = typeof step === 'number' && typeof totalSteps === 'number';
  const percentage = hasCounter ? Math.round((step / totalSteps) * 100) : 0;

  return (
    <div className="focus-shell">
      <div className="focus-shell__frame">
        <header className="focus-shell__header">
          <div className="focus-shell__header-row">
            <button
              type="button"
              className="focus-shell__close"
              onClick={() => navigate(closeTo)}
            >
              <Icon name="close" size={22} />
              <span className="visually-hidden">Sluiten</span>
            </button>
            <span className="focus-shell__title">{title}</span>
            {hasCounter ? (
              <span className="focus-shell__counter">
                {step} / {totalSteps}
              </span>
            ) : (
              <span className="focus-shell__counter" aria-hidden="true" />
            )}
          </div>
          {hasCounter && (
            <div
              className="focus-shell__progress"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Voortgang in deze module"
            >
              <div className="focus-shell__progress-fill" style={{ width: `${percentage}%` }} />
            </div>
          )}
        </header>

        <main className="focus-shell__content">{children}</main>

        {footer && <footer className="focus-shell__footer">{footer}</footer>}
      </div>
    </div>
  );
}
