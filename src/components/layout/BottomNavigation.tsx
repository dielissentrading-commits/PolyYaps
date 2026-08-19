import { NavLink, useLocation } from 'react-router-dom';
import { Icon, type IconName } from '@/components/ui/Icon';
import './BottomNavigation.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** Sub-screens that should keep this tab highlighted. */
  alsoMatches?: string[];
}

/** The four persistent primary tabs — docs/06-app-design.md, section 6A. */
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/learn', label: 'Leren', icon: 'path' },
  { to: '/review', label: 'Review', icon: 'review' },
  {
    to: '/progress',
    label: 'Voortgang',
    icon: 'progress',
    alsoMatches: ['/passport', '/achievements'],
  },
];

export function BottomNavigation() {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Hoofdnavigatie">
      <ul className="bottom-nav__list">
        {NAV_ITEMS.map((item) => {
          const forced = item.alsoMatches?.some((prefix) => pathname.startsWith(prefix)) ?? false;

          return (
            <li key={item.to} className="bottom-nav__item">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive || forced
                    ? 'bottom-nav__link bottom-nav__link--active'
                    : 'bottom-nav__link'
                }
              >
                <span className="bottom-nav__icon">
                  <Icon name={item.icon} size={24} />
                </span>
                <span className="bottom-nav__label">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
