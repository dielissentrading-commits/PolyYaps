import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { BottomNavigation } from './BottomNavigation';
import './AppShell.css';

/**
 * Explore mode — docs/06-app-design.md, section 6B.
 * Bottom navigation stays visible; every non-lesson screen renders inside this.
 */
export function AppShell() {
  const { pathname } = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Each screen starts at the top, the way a native tab switch behaves.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="app-shell">
      <div className="app-shell__frame">
        <div className="app-shell__content" ref={contentRef}>
          <Outlet />
          <div className="app-shell__content-end" />
        </div>
        <BottomNavigation />
      </div>
    </div>
  );
}
