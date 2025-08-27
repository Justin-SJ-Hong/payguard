import { Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import { useUserStore } from '../../store/userStore';

export default function HomeEntry() {
  const isLoggedIn = !!useUserStore((state) => state.user);

  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}
