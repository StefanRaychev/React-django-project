import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function PublicRoute({ children }) {
    const { isAuthenticated, user } = useAuth();

    // Allow access to register page even if user is authenticated
    if (isAuthenticated && (window.location.pathname === "/lector/register" || window.location.pathname === "/student/register")) {
        return children;
    }

    // Redirect to appropriate dashboard
    if (!isAuthenticated) return children;

    if (user?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (user?.role === 'lector') return <Navigate to="/lector/dashboard" replace />;

    return <Navigate to="/" replace />;
}

export default PublicRoute;

