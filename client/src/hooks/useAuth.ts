import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: null | {
    id: string;
    email: string;
  };
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await fetch('/api/auth/validate', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: userData,
          });
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Token validation error:', error);
        handleLogout();
      }
    };

    validateToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  const handleLogin = (userData: {
    token: string;
    user: AuthState['user'];
  }) => {
    localStorage.setItem('authToken', userData.token);
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: userData.user,
    });
  };

  return {
    ...authState,
    handleLogin,
    handleLogout,
  };
};
