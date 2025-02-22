import React from 'react';
import { usePasskeyLogin } from '../hooks/useLoginWithPasskey.ts';
// import createPasskey from '../services/passkeyService.ts';  // API request
// import { validateEmail } from '../utils/validation.ts'; // email validation
import '../styles/forms.css';

interface PasskeyLoginProps {
  onLogin: (userData: {
    token: string;
    user: { id: string; email: string } | null;
  }) => void;
}

const PasskeyLogin: React.FC<PasskeyLoginProps> = ({ onLogin }) => {
  const { email, error, isLoading, handleSubmit, handleEmailChange } =
    usePasskeyLogin(onLogin);

  return (
    <div className='auth-form-container passkey-form'>
      <h2 className='form-title'>Login with Passkey</h2>

      <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
        Use your device's biometric authentication or PIN
      </p>

      {error && (
        <div
          className='form-error'
          style={{ marginBottom: '1rem', textAlign: 'center' }}
        >
          {error}
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
            value={email}
            onChange={handleEmailChange}
            className='form-input'
            disabled={isLoading}
            required
          />
        </div>

        <button type='submit' className='form-button' disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Continue with Passkey'}
        </button>
      </form>

      <div className='form-divider'>
        <span>or</span>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <a href='/login' className='form-link'>
          Login with password instead
        </a>
      </p>

      <p style={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <a href='/' className='form-link'>
          Create one here
        </a>
      </p>
    </div>
  );
};
//   return (
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label htmlFor='email'>Email:</label>
//         <input
//           type='email'
//           id='email'
//           value={email}
//           onChange={handleEmailChange}
//           disabled={isLoading}
//           required
//         />
//       </div>
//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       <button type='submit' disabled={isLoading}>
//         {isLoading ? 'Logging in...' : 'Login now'}
//       </button>
//     </form>
//   );
// };

export default PasskeyLogin;
