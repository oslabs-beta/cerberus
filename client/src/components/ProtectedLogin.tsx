// src/components/ProtectedLogin.tsx
import { Navigate, Outlet } from 'react-router-dom';

//typescript interface with two props
interface ProtectedRouteProps {
  isAuthenticated: boolean;
  redirectPath?: string;
}

//if authenticated then access content of the route via Outlet
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  redirectPath = '/',
}) => {
  if (!isAuthenticated) {
    //redirect to login if user not authenticated/replace current entry in history
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
