export interface LoginResponse {
  verification: boolean;
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface UseLoginWithPasskeyProps {
  onLogin: (data: {
    token: string;
    user: { id: string; email: string };
  }) => void;
}
