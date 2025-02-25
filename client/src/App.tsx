import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';

// Components
import LandingLayout from './components/LandingLayout';
import SignUp from './components/Sign-up';
import Login from './components/Login';
import ForgotPW from './components/Forgot-PW';
import Dashboard from './components/Dashboard';
import CreatePasskey from './components/CreatePasskey';
import PasskeyLogin from './components/PasskeyLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Oauth from './components/Oauth';
import ChatWidget from './components/ChatWidget'; // 

// Styles
import './App.css';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, handleLogin, handleLogout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
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
                <Login onLogin={handleLogin} />
              )
            }
          />
          <Route
            path='/login-passkey'
            element={
              isAuthenticated ? (
                <Navigate to='/dashboard' replace />
              ) : (
                <PasskeyLogin onLogin={handleLogin} />
              )
            }
          />
          <Route
            path='/signup'
            element={
              isAuthenticated ? (
                <Navigate to='/dashboard' replace />
              ) : (
                <SignUp />
              )
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

      {/* ✅ 在整个 App 里添加 Chatbot 按钮 */}
      <ChatWidget />
    </Router>
  );
};

export default App;
