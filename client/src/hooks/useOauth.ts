import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useOAuth = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const startOAuth = (provider: 'github' | 'google') => {
    setIsLoading(true);
    const state = crypto.randomUUID();
    sessionStorage.setItem('oauth_state', state);

    let authUrl = '';
    if (provider === 'github') {
      authUrl = `https://github.com/login/oauth/authorize?
        client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&
        state=${state}`;
    } else {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
        client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&
        redirect_uri=${encodeURIComponent(window.location.origin + '/callback')}&
        response_type=code&
        scope=email profile&
        state=${state}`;
    }

    window.location.href = authUrl;
  };

  return { startOAuth, isLoading, error };
};

export default useOAuth;