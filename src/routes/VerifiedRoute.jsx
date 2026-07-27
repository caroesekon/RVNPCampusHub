import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const VerifiedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user?.hdmVerified) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};