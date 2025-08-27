import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

export default function RedirectToDashboard() {
  const isLoggedIn = useUserStore((state) => state.user);

  return isLoggedIn ? <Navigate to="/dashboard" replace /> : null;
}
