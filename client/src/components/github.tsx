import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOAuth from '../hooks/useOauth.ts';

const GithubPage = () => {
  const navigate = useNavigate();
  const { isLoading: isOAuthLoading, githubToken } = useOAuth();

  useEffect(() => {
    if (githubToken) {
      navigate('/');
    }
  }, [githubToken, navigate]); 

  const handleOAuthLogin = () => {
    window.location.assign(
      'https://github.com/login/oauth/authorize?client_id=' +
        import.meta.env.VITE_CLIENT_ID
    );
  };

  return (
    <div>
      {isOAuthLoading ? (
        <div>Loading...</div>
      ) : (
        !githubToken && (
          <button onClick={handleOAuthLogin}>
            Sign in with GitHub
          </button>
        )
      )}
    </div>
  );
};

export default GithubPage;