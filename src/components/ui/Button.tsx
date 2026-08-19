import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

type Variant = 'primary' | 'secondary' | 'text';

interface BaseProps {
  variant?: Variant;
  fullWidth?: boolean;
  children: ReactNode;
  /** Optional trailing element, typically an icon. */
  trailing?: ReactNode;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

function classesFor(variant: Variant, fullWidth?: boolean, extra?: string) {
  return ['btn', `btn--${variant}`, fullWidth ? 'btn--full' : '', extra ?? '']
    .filter(Boolean)
    .join(' ');
}

export function Button({
  variant = 'primary',
  fullWidth,
  children,
  trailing,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classesFor(variant, fullWidth, className)} {...rest}>
      <span className="btn__label">{children}</span>
      {trailing && <span className="btn__trailing">{trailing}</span>}
    </button>
  );
}

interface ButtonLinkProps extends BaseProps {
  to: string;
  className?: string;
}

/** Same visual treatment, but it navigates. */
export function ButtonLink({
  to,
  variant = 'primary',
  fullWidth,
  children,
  trailing,
  className,
}: ButtonLinkProps) {
  return (
    <Link to={to} className={classesFor(variant, fullWidth, className)}>
      <span className="btn__label">{children}</span>
      {trailing && <span className="btn__trailing">{trailing}</span>}
    </Link>
  );
}
