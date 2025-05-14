import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
    const { auth } = useAuth();
    const location = useLocation();
    const token = localStorage.getItem('authToken');

    if (!token || !auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(auth.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;