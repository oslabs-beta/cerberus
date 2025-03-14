import { useState } from 'react';
import { createPasskey } from '../services/passkeyService.ts'; // API call
import { validateEmail } from '../utils/validation.ts'; // email validation
import { useNavigate } from 'react-router-dom';

interface UsePasskeyFormReturn {
  email: string;
  error: string | null;
  isLoading: boolean;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useCreatePasskey = (): UsePasskeyFormReturn => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

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
      await createPasskey(email);
      // handle success
      navigate('/login-passkey');
      alert('Passkey created successfully!');
    } catch {
      setError('Failed to create passkey. Please try again.');
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
