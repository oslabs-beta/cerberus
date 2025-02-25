```javascript
// Example: React application with Cerberus auth
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  useAuth,
  PasskeyLogin,
  CreatePasskey,
  ProtectedRoute,
} from 'cerberus-auth/frontend';

function App() {
  const { isAuthenticated, isLoading, user, handleLogin, handleLogout } =
    useAuth();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path='/register' element={<CreatePasskey />} />
      <Route
        path='/login'
        element={<PasskeyLogin onLogin={(userData) => handleLogin(userData)} />}
      />

      {/* Protected route */}
      <Route
        path='/dashboard'
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function Dashboard({ user, onLogout }) {
  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default App;
```
