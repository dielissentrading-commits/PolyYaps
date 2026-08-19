import { TopBar } from '@/components/layout/TopBar';
import { ButtonLink } from '@/components/ui/Button';

export function NotFoundScreen() {
  return (
    <>
      <TopBar title="Niet gevonden" showBack backTo="/" />
      <div className="page">
        <div className="placeholder">
          <span className="placeholder__title">Deze pagina bestaat niet</span>
          Het scherm dat je zoekt is er nog niet, of de link klopt niet.
        </div>
        <div className="section--tight">
          <ButtonLink to="/" fullWidth>
            Terug naar home
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
