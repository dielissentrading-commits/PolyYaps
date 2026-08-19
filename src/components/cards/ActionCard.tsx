import { Link } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import './ActionCard.css';

interface ActionCardProps {
  to: string;
  icon: IconName;
  title: string;
  description: string;
  /** Short right-aligned value, e.g. an item count. */
  badge?: string;
  tone?: 'neutral' | 'primary' | 'success';
}

/**
 * Secondary navigation card — used for Smart Review and Today's Focus on Home,
 * and for the Passport / Achievements entries on Progress.
 */
export function ActionCard({
  to,
  icon,
  title,
  description,
  badge,
  tone = 'neutral',
}: ActionCardProps) {
  return (
    <Link to={to} className={`action-card action-card--${tone}`}>
      <span className="action-card__icon">
        <Icon name={icon} size={22} />
      </span>
      <span className="action-card__body">
        <span className="action-card__title">{title}</span>
        <span className="action-card__description">{description}</span>
      </span>
      {badge && <span className="action-card__badge">{badge}</span>}
      <Icon name="chevron-right" size={20} className="action-card__chevron" />
    </Link>
  );
}
