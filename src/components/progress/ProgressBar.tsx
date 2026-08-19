import './ProgressBar.css';

interface ProgressBarProps {
  /** 0–100. */
  value: number;
  label?: string;
  tone?: 'primary' | 'success';
  size?: 'thin' | 'regular';
}

export function ProgressBar({
  value,
  label,
  tone = 'primary',
  size = 'regular',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className={`progress-bar progress-bar--${size}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={`progress-bar__fill progress-bar__fill--${tone}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
