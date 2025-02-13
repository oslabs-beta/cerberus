import useOAuth from '../hooks/useOAuth';

const AuthButtons = () => {
  const { startOAuth } = useOAuth();

  return (
    <div className="auth-providers">
      <button 
        onClick={() => startOAuth('google')}
        className="google-btn"
      >
        Continue with Google
      </button>
      <button
        onClick={() => startOAuth('github')}
        className="github-btn"
      >
        Continue with GitHub
      </button>
    </div>
  );
};

export default AuthButtons;