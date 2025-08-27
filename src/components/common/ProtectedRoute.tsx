import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { supabase } from '../lib/supabase';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const user = useUserStore((state) => state.user);
  const location = useLocation();

  const isDeleted = (user as any)?.is_deleted;

  useEffect(() => {
    const handleSoftDeleted = async () => {
      if (isDeleted) {
        await supabase.auth.signOut();
        useUserStore.setState({ user: null });
      }
    };
    handleSoftDeleted();
  }, [isDeleted]);

  if (!user || isDeleted) {
    return <Navigate to={`/login?from=${location.pathname}`} replace />;
  }

  return children;
}
