import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';

export default function RedirectToDashboard() {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return isLoggedIn ? <Navigate to="/dashboard" replace /> : null;
}
