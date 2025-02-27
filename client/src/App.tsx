import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Components
import LandingLayout from './components/LandingLayout';
import SignUp from './components/Sign-up';
import Login from './components/Login';
import ForgotPW from './components/Forgot-PW';
import Dashboard from './components/Dashboard';
import CreatePasskey from './components/CreatePasskey';
import PasskeyLogin from './components/PasskeyLogin';
import ProtectedRoute from './components/ProtectedRoute';

// Styles
import './App.css';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, handleLogin, handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log(
        'User authenticated in App.tsx, current path:',
        location.pathname
      );

      const publicRoutes = [
        '/',
        '/login',
        '/login-passkey',
        '/signup',
        '/forgot-password',
      ];
      if (publicRoutes.includes(location.pathname)) {
        console.log('Redirecting from public route to dashboard');
        // Use a timeout to ensure state has stabilized
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
    }
  }, [isAuthenticated, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className='app-loading-container'>
        <div className='app-loading-spinner'></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes with landing layout */}
      <Route
        element={
          <LandingLayout
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        }
      >
        {/* Default route - CreatePasskey */}
        <Route
          path='/'
          element={
            isAuthenticated ? (
              <Navigate to='/dashboard' replace />
            ) : (
              <CreatePasskey />
            )
          }
        />
        <Route
          path='/login'
          element={
            isAuthenticated ? (
              <Navigate to='/dashboard' replace />
            ) : (
              <Login onLogin={(userData) => handleLogin(userData)} />
            )
          }
        />
        {/* Passkey Login route */}
        <Route
          path='/login-passkey'
          element={
            isAuthenticated ? (
              <Navigate to='/dashboard' replace />
            ) : (
              <PasskeyLogin onLogin={(userData) => handleLogin(userData)} />
            )
          }
        />

        {/* Sign up route */}
        <Route
          path='/signup'
          element={
            isAuthenticated ? <Navigate to='/dashboard' replace /> : <SignUp />
          }
        />
        <Route
          path='/forgot-password'
          element={
            isAuthenticated ? (
              <Navigate to='/dashboard' replace />
            ) : (
              <ForgotPW />
            )
          }
        />
      </Route>

      {/* Protected routes */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

export default App;
