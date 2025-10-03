
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import { UserRole } from './types';
import UpdatePassword from './pages/shared/UpdatePassword';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Main />
      </HashRouter>
    </AuthProvider>
  );
};

const Main: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
            
            <Route path="/" element={
                !user ? (
                    <Navigate to="/login" />
                ) : user.role === UserRole.ADMIN ? (
                    <Navigate to="/admin" />
                ) : user.role === UserRole.STORE_OWNER ? (
                    <Navigate to="/owner" />
                ) : (
                    <Navigate to="/dashboard" />
                )
            } />

            <Route path="/admin/*" element={<ProtectedRoute role={UserRole.ADMIN}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute role={UserRole.NORMAL_USER}><UserDashboard /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute role={UserRole.STORE_OWNER}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/update-password" element={<ProtectedRoute><UpdatePassword /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

interface ProtectedRouteProps {
    children: React.ReactElement;
    role?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }
    
    if (role && user.role !== role) {
        return <Navigate to="/" />;
    }

    return children;
};


export default App;
