import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormValidation } from '../hooks/formValidation';
import '../styles/forms.css';

interface SignUpProps {
  onSignUpSuccess?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { errors, validateForm } = useFormValidation({
    email: true,
    password: true,
    confirmPassword: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      console.log(data);

      if (onSignUpSuccess) {
        onSignUpSuccess();
      }

      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='auth-form-container password-form'>
      <h2 className='form-title'>Create an Account</h2>
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

        <div className='form-group'>
          <label htmlFor='confirmPassword' className='form-label'>
            Confirm Password
          </label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            className='form-input'
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
            required
          />
          {errors.confirmPassword && (
            <div className='form-error'>{errors.confirmPassword}</div>
          )}
        </div>

        <button type='submit' className='form-button' disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <a href='/login' className='form-link'>
        Already registered? Click here to login
      </a>

      <div className='form-divider'>
        <span>or</span>
      </div>

      <a href='/' className='form-link'>
        Sign up with a passkey instead
      </a>
    </div>
  );
};

export default SignUp;
