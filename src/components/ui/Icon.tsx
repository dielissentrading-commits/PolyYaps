import type { SVGProps } from 'react';

/**
 * The shell's icon set. Line icons on a 24px grid, stroked with currentColor so
 * they inherit navigation and button states.
 */
export type IconName =
  | 'home'
  | 'path'
  | 'review'
  | 'progress'
  | 'chevron-right'
  | 'arrow-left'
  | 'close'
  | 'settings'
  | 'flame'
  | 'sparkle'
  | 'star'
  | 'lock'
  | 'check'
  | 'passport'
  | 'trophy'
  | 'mic'
  | 'sound';

const PATHS: Record<IconName, string> = {
  home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1v-8.5Z',
  path: 'M7 4v6a3 3 0 0 0 3 3h4a3 3 0 0 1 3 3v4M7 4a1.6 1.6 0 1 0 0-.001M17 20a1.6 1.6 0 1 0 0-.001',
  review: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4',
  progress: 'M5 20V10m7 10V4m7 16v-7',
  'chevron-right': 'm9 6 6 6-6 6',
  'arrow-left': 'M20 12H4m0 0 6-6m-6 6 6 6',
  close: 'M6 6l12 12M18 6 6 18',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM4.5 12a7.5 7.5 0 0 1 .2-1.6l-1.6-1.3 1.9-3.3 2 .7A7.5 7.5 0 0 1 9.7 5l.3-2h4l.3 2c.9.3 1.7.7 2.4 1.3l2-.7 1.9 3.3-1.6 1.3a7.5 7.5 0 0 1 0 3.2l1.6 1.3-1.9 3.3-2-.7c-.7.6-1.5 1-2.4 1.3l-.3 2h-4l-.3-2a7.5 7.5 0 0 1-2.4-1.3l-2 .7-1.9-3.3 1.6-1.3A7.5 7.5 0 0 1 4.5 12Z',
  flame: 'M12 3s5 4 5 8.5A5 5 0 0 1 7 12c0-1.6.8-2.9 1.6-3.8.2 1.3.9 2 1.7 2.2C10.6 8 12 6.3 12 3Z',
  sparkle: 'M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9 12 3.5Z',
  star: 'm12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8L12 4Z',
  lock: 'M7 11V8.5a5 5 0 0 1 10 0V11M6 11h12v9H6v-9Z',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  passport: 'M6 4h12v16H6V4Zm3 0v16M12 8.5a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4Zm-1.8 7.5h3.6',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 5H5v1.5A3.5 3.5 0 0 0 8 10M16 5h3v1.5A3.5 3.5 0 0 1 16 10M10 20h4m-2-3v3',
  mic: 'M12 4a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-5 0v-5A2.5 2.5 0 0 1 12 4ZM6 11a6 6 0 0 0 12 0M12 17v3',
  sound: 'M5 9.5h3L12 6v12l-4-3.5H5v-5Zm11-1a4.5 4.5 0 0 1 0 7m2.5-9.5a8 8 0 0 1 0 12',
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 24, filled = false, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
