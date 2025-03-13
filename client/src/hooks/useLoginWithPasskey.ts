import { useState } from 'react';
import { login } from '../services/passkeyService.ts'; // API call
import { validateEmail } from '../utils/validation.ts'; // email validation
import { UseLoginWithPasskeyProps } from './types';
// import { useNavigate } from 'react-router-dom';

interface UsePasskeyFormReturn {
  email: string;
  error: string | null;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const usePasskeyLogin = (
  onLogin: UseLoginWithPasskeyProps['onLogin'],
  onLoginSuccess?: () => void
): UsePasskeyFormReturn => {
  // const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      console.log('Attempting login with email:', email);
      const loginResult = await login(email);
      console.log('Login successful, user:', loginResult.user);

      // After successful login, call the onLogin prop
      onLogin({
        user: loginResult.user,
      });
      // navigate('/dashboard');

      console.log('Called onLogin handler');

      setTimeout(() => {
        if (onLoginSuccess) {
          console.log('Calling onLoginSuccess callback for navigation');
          onLoginSuccess();
        } else {
          console.log('No onLoginSuccess callback provided');
          // If no callback is provided, you could use window.location as a fallback
          // window.location.href = '/dashboard';
        }
      }, 100);
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
