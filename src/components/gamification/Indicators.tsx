import { Icon } from '@/components/ui/Icon';
import type { StarCount } from '@/types';
import './Indicators.css';

/**
 * Restrained gamification — docs/06-app-design.md, section 6C.
 * Numbers and small marks, no confetti or mascots.
 */

export function StreakIndicator({ days }: { days: number }) {
  return (
    <span className="indicator indicator--streak">
      <Icon name="flame" size={16} />
      <span className="indicator__value">{days}</span>
      <span className="indicator__unit">dagen</span>
    </span>
  );
}

export function XPIndicator({ xp }: { xp: number }) {
  return (
    <span className="indicator indicator--xp">
      <Icon name="sparkle" size={16} />
      <span className="indicator__value">{xp.toLocaleString('nl-NL')}</span>
      <span className="indicator__unit">XP</span>
    </span>
  );
}

export function Stars({ count, max = 3 }: { count: StarCount; max?: number }) {
  return (
    <span className="stars" aria-label={`${count} van ${max} sterren`}>
      {Array.from({ length: max }, (_, index) => (
        <Icon
          key={index}
          name="star"
          size={14}
          filled={index < count}
          className={index < count ? 'stars__star stars__star--on' : 'stars__star'}
        />
      ))}
    </span>
  );
}
