import { Navigate, Outlet } from "react-router-dom";
import AuthProvider from "../contexts/AuthContext";
import { useToken } from "../hooks/useToken";

interface AuthGuardProps {
  isPrivate?: boolean;
}

function AuthGuard({ isPrivate = false }: AuthGuardProps) {
  const { access_token } = useToken();

  if (!access_token && isPrivate) {
    return <Navigate to="/login" replace />;
  }

  if (access_token && !isPrivate) {
    return <Navigate to="/sequenciamento" replace />;
  }

  return (
    <AuthProvider>
      <Outlet />;
    </AuthProvider>
  );
}
export default AuthGuard;
