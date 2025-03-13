import React, { useState } from 'react';
import { useFormValidation } from '../hooks/formValidation';
import '../styles/forms.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { errors, validateEmail } = useFormValidation({
    email: true,
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to process password reset request');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset error:', error);
      setSubmitError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='auth-form-container password-form'>
        <h2 className='form-title'>Check Your Email</h2>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          If an account exists for {email}, we've sent password reset
          instructions to it.
        </p>
        <p style={{ textAlign: 'center', color: '#666' }}>
          Please check your email and follow the instructions to reset your
          password.
        </p>
        <a href='/login' className='form-link' style={{ marginTop: '2rem' }}>
          Return to login
        </a>
      </div>
    );
  }

  return (
    <div className='auth-form-container password-form'>
      <h2 className='form-title'>Reset Your Password</h2>

      <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
        Enter your email address and we'll send you instructions to reset your
        password.
      </p>

      {submitError && (
        <div
          className='form-error'
          style={{ marginBottom: '1rem', textAlign: 'center' }}
        >
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='email' className='form-label'>
            Email Address
          </label>
          <input
            type='email'
            id='email'
            name='email'
            className='form-input'
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            required
          />
          {errors.email && <div className='form-error'>{errors.email}</div>}
        </div>

        <button type='submit' className='form-button' disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Reset Password'}
        </button>
      </form>

      <a href='/login' className='form-link'>
        Back to login
      </a>

      <div className='form-divider'>
        <span>or</span>
      </div>

      <a href='/login-passkey' className='form-link'>
        Try logging in with a passkey
      </a>
    </div>
  );
};

export default ForgotPassword;
