import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation } from '../hooks/formValidation';
import '../styles/forms.css';

interface LoginProps {
  onLogin: (userData: {
    token: string;
    user: { id: string; email: string } | null;
  }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const { errors, validateForm } = useFormValidation({
    email: true,
    password: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setLoginError(''); // Clear any previous login errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include', // Important for handling cookies
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();

      onLogin({
        token: data.token,
        user: data.user,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='auth-form-container password-form'>
      <h2 className='form-title'>Welcome Back</h2>

      {loginError && (
        <div
          className='form-error'
          style={{ marginBottom: '1rem', textAlign: 'center' }}
        >
          {loginError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='email' className='form-label'>
            Email
          </label>
          <input
            type='email'
            id='email'
            name='email'
            className='form-input'
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
          {errors.email && <div className='form-error'>{errors.email}</div>}
        </div>

        <div className='form-group'>
          <label htmlFor='password' className='form-label'>
            Password
          </label>
          <input
            type='password'
            id='password'
            name='password'
            className='form-input'
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
          {errors.password && (
            <div className='form-error'>{errors.password}</div>
          )}
        </div>

        <a
          href='/forgot-password'
          className='form-link'
          style={{ textAlign: 'right', marginBottom: '1rem' }}
        >
          Forgot your password?
        </a>

        <button type='submit' className='form-button' disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <a href='/signup' className='form-link'>
        Don't have an account? Sign up
      </a>

      <div className='form-divider'>
        <span>or</span>
      </div>

      <a href='/login-passkey' className='form-link'>
        Login with a passkey instead
      </a>
    </div>
  );
};

export default Login;
