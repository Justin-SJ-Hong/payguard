import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';

export default function HomeEntry() {
  const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}
