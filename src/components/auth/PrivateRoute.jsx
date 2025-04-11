import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    const location = useLocation();

    if (!token) {
        sessionStorage.setItem('redirectPath', location.pathname);
        return <Navigate to="/forbidden" replace state={{ from: location }} />;
    }

    try {
        const isValidToken = token && token.length > 0;
        if (!isValidToken) {
            localStorage.removeItem('authToken');
            return <Navigate to="/forbidden" replace />;
        }
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('authToken');
        return <Navigate to="/forbidden" replace />;
    }

    return children;
};

export default PrivateRoute;