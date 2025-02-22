import React from 'react';
// import { useCreatePasskey } from '@/hooks/useCreatePasskey'; // custom hook
import { useCreatePasskey } from '../hooks/useCreatePasskey'; // custom hook
// import createPasskey from '../services/passkeyService.ts';  // API request
// import { validateEmail } from '../utils/validation.ts'; // email validation
import '../styles/forms.css';

const CreatePasskey = () => {
  const { email, error, isLoading, handleSubmit, handleEmailChange } =
    useCreatePasskey();

  return (
    <div className='auth-form-container passkey-form'>
      <h2 className='form-title'>Create a Passkey</h2>

      <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
        Set up passkey authentication for faster, more secure login
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
          {isLoading ? 'Creating...' : 'Create Passkey'}
        </button>
      </form>

      <div className='form-divider'>
        <span>or</span>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <a href='/signup' className='form-link'>
          Sign up with password instead
        </a>
      </p>

      <p style={{ textAlign: 'center' }}>
        Already have a passkey?{' '}
        <a href='/login-passkey' className='form-link'>
          Login here
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
//         {isLoading ? 'Creating...' : 'Create Passkey'}
//       </button>
//       <div>
//         Already have an account? <a href='/login-passkey'>Click here</a>
//       </div>
//     </form>
//   );
// };

export default CreatePasskey;
