import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('Checking authentication status...');
      // Use the correct endpoint
      const response = await fetch('/api/user/me', {
        credentials: 'include',
        cache: 'no-store', // Prevent caching
      });
      console.log('Auth check response status:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('User is authenticated:', userData);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: userData,
        });
      } else if (response.status === 401) {
        console.log('User is not authenticated (401 status)');
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      } else {
        console.warn(`Auth check failed with status: ${response.status}`);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/user/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Logout failed:', await response.text());
      }

      // Clear authentication state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });

      // Force a page reload to clear any in-memory state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server request fails, update the local state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  const handleLogin = (userData: { user: User | null }) => {
    console.log('handleLogin called with:', userData);
    if (userData && userData.user) {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: userData.user,
      });
    } else {
      console.error('Received invalid user data in handleLogin:', userData);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };
  const refreshAuthStatus = () => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));
    checkAuthStatus();
  };
  return {
    ...authState,
    handleLogin,
    handleLogout,
    refreshAuthStatus,
  };
};
