import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedNotice() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div className="alert info">
      Für diese Ansicht ist ein Login sinnvoll. Gehe zuerst zur <Link to="/">Login-Seite</Link>.
    </div>
  );
}
