import { useState, useEffect } from "react";

export default function useOAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (code && state) {
        try {
          const res = await fetch("/api/oauth/github", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, state }),
          });

          if (!res.ok) throw new Error("Authentication failed");
          window.history.replaceState({}, "", window.location.pathname);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
      setIsLoading(false);
    };

    handleAuth();
  }, []);

  return { isLoading, error };
}