import { Navigate, Outlet } from 'react-router-dom';
import { useToken } from '../hooks/useToken';

interface AuthGuardProps {
  isPrivate?: boolean;
}

function AuthGuard({ isPrivate = false }: AuthGuardProps) {
  const {access_token} = useToken();

  if (!access_token && isPrivate) {
    return <Navigate to="/login" replace />
  }

  if (access_token && !isPrivate) {
    return <Navigate to="/" replace />
  }

  return <Outlet />;
}
export default AuthGuard