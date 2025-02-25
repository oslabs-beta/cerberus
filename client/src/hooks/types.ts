export interface LoginResponse {
  verification: boolean;
  user: {
    id: string;
    email: string;
  };
}

export interface UseLoginWithPasskeyProps {
  onLogin: (data: { user: { id: string; email: string } | null }) => void;
}
