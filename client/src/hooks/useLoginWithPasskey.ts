import { useState } from 'react';
import { login } from '../services/passkeyService.ts'; // API call
import { validateEmail } from '../utils/validation.ts'; // email validation
import { UseLoginWithPasskeyProps } from './types';
// import { LoginResponse, UseLoginWithPasskeyProps } from './types';

interface UsePasskeyFormReturn {
  email: string;
  error: string | null;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const usePasskeyLogin = (
  onLogin: UseLoginWithPasskeyProps['onLogin']
): UsePasskeyFormReturn => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const loginResult = await login(email);
      // After successful login, call the onLogin prop
      onLogin({
        token: loginResult.token,
        user: loginResult.user,
      });

      // const success = await login(email);
      // if (success) {
      //   navigate('/Dashboard');
      //   console.log('Logged in successfully!');
      // }
    } catch (error) {
      setError('Failed to log in. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    error,
    isLoading,
    handleSubmit,
    handleEmailChange,
  };
};
