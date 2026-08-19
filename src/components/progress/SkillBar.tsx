import { ProgressBar } from './ProgressBar';
import './SkillBar.css';

interface SkillBarProps {
  label: string;
  /** 0–100. */
  score: number;
}

export function SkillBar({ label, score }: SkillBarProps) {
  return (
    <div className="skill-bar">
      <div className="skill-bar__header">
        <span className="skill-bar__label">{label}</span>
        <span className="skill-bar__score">{score}%</span>
      </div>
      <ProgressBar value={score} label={label} tone={score >= 75 ? 'success' : 'primary'} />
    </div>
  );
}
