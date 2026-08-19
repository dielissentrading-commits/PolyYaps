import { Icon } from '@/components/ui/Icon';
import type { LearningItem } from '@/types';
import './learning.css';

interface StudyCardProps {
  item: LearningItem;
  /** True when the item was introduced on an earlier day. */
  isRepeat: boolean;
  onListen?: () => void;
}

/** "Zien en horen" — the first stage of the learning cycle. */
export function StudyCard({ item, isRepeat, onListen }: StudyCardProps) {
  return (
    <div className="learn-card">
      <p className="learn-card__label muted small">
        {isRepeat
          ? `Herhaling uit dag ${item.dayIntroduced}`
          : item.type === 'chunk'
            ? 'Nieuwe zin'
            : 'Nieuw woord'}
      </p>

      <p className="learn-card__target" lang="pt-PT">
        {item.portuguese}
      </p>
      <p className="learn-card__translation muted">{item.dutch}</p>

      <button type="button" className="learn-card__audio" onClick={onListen}>
        <Icon name="sound" size={20} />
        <span>Luister</span>
      </button>
    </div>
  );
}
