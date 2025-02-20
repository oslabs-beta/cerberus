import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Container from './components/Container';
import SignUp from './components/Sign-up';
import Login from './components/Login';
import ForgotPW from './components/Forgot-PW';
import Dashboard from './components/Dashboard';
import CreatePasskey from './components/CreatePasskey';
import PasskeyLogin from './components/PasskeyLogin';
import ProtectedRoute from './components/ProtectedLogin';

//functional component App but in typescript, state set to false to show user not authenticated
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is authenticated on component mount
  useEffect(() => {
    //check if token present in local storage
    //local storage built in web api that provides a way to store key-value pairs in a web browser., getItem retrieves the value associated with the key 'authToken' from localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      //validate the token here
      setIsAuthenticated(true);
    }
  }, []);

  // Function to handle logout - remove token on logout and set authentication to false
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Container />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route
          path='/login'
          element={
            isAuthenticated ? (
              <Navigate to='/Dashboard' replace />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route path='/Forgot-PW' element={<ForgotPW />} />
        <Route path='/create-passkey' element={<CreatePasskey />} />
        <Route path='/login-passkey' element={<PasskeyLogin />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route
            path='/Dashboard'
            element={<Dashboard onLogout={handleLogout} />}
          />
          {/* Add any other protected routes here */}
        </Route>

        {/* Fallback route - redirect to home or dashboard based on auth status */}
        <Route
          path='*'
          element={
            <Navigate to={isAuthenticated ? '/Dashboard' : '/'} replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
