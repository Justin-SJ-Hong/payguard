import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const isLoggedIn = useUserStore((state) => state.user);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={`/login?from=${location.pathname}`} replace />;
  }

  return children;
}
