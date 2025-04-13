import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
    const { auth } = useAuth();
    const location = useLocation();

    if (!auth.isAuthenticated) {
        sessionStorage.setItem('redirectPath', location.pathname);
        return <Navigate to={ROUTES.FORBIDDEN} replace state={{ from: location }} />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(auth.role)) {
        return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }

    return children;
};

export default PrivateRoute;