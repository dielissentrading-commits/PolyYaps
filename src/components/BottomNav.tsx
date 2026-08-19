type Tab = 'home' | 'learn' | 'review' | 'progress';

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

const tabs: { id: Tab; icon: string; label: string }[] = [
  { id: 'home', icon: '⌂', label: 'Home' },
  { id: 'learn', icon: '◫', label: 'Learn' },
  { id: 'review', icon: '↻', label: 'Review' },
  { id: 'progress', icon: '▥', label: 'Progress' },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Hoofdnavigatie">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
