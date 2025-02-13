import { useState } from 'react';
import { login } from '../services/passkeyService.ts'; // API call
import { validateEmail } from '../utils/validation.ts'; // email validation

interface UsePasskeyFormReturn {
  email: string;
  error: string | null;
  isLoading: boolean;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

// console.log('Loading useLoginWithPasskey.ts');

export const usePasskeyLogin = (): UsePasskeyFormReturn => {
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
      await login(email);
      // handle success
      alert('Logged in successfully!');
    } catch {
      setError('Failed to log in. Please try again.');
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
