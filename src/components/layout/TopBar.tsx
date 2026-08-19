import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import './TopBar.css';

interface TopBarProps {
  /** Show the PolyYaps wordmark instead of a page title (Home). */
  brand?: boolean;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  /** Where back goes when there is no history to pop. */
  backTo?: string;
  action?: ReactNode;
}

export function TopBar({ brand, title, subtitle, showBack, backTo, action }: TopBarProps) {
  const navigate = useNavigate();

  const goBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="top-bar">
      <div className="top-bar__left">
        {showBack && (
          <button type="button" className="top-bar__icon-button" onClick={goBack}>
            <Icon name="arrow-left" size={22} />
            <span className="visually-hidden">Terug</span>
          </button>
        )}
        {brand ? (
          <span className="top-bar__brand">
            Poly<span className="top-bar__brand-accent">Yaps</span>
          </span>
        ) : (
          <div className="top-bar__titles">
            {title && <h1 className="top-bar__title">{title}</h1>}
            {subtitle && <p className="top-bar__subtitle">{subtitle}</p>}
          </div>
        )}
      </div>
      {action && <div className="top-bar__right">{action}</div>}
    </header>
  );
}
