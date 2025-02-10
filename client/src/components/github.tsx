import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useOAuth from "../hooks/useOauth";

const GithubPage = () => {
  const navigate = useNavigate();
  const { isLoading, error } = useOAuth();

  const handleLogin = () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem("oauth_state", state);
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${
      import.meta.env.VITE_CLIENT_ID
    }&state=${state}`;
  };

  useEffect(() => {
    if (!isLoading && !error) navigate("/");
  }, [isLoading, error, navigate]);

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <div>
          <p>Error: {error}</p>
          <button onClick={handleLogin}>Retry</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Sign in with GitHub</button>
      )}
    </div>
  );
};

export default GithubPage;