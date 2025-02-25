// src/frontend/index.ts
// Authentication components
export { default as CreatePasskey } from './components/CreatePasskey';
export { default as PasskeyLogin } from './components/PasskeyLogin';
export { default as Login } from './components/Login';
export { default as ProtectedRoute } from './components/ProtectedRoute';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useCreatePasskey } from './hooks/useCreatePasskey';
export { usePasskeyLogin } from './hooks/useLoginWithPasskey';
export { useProtectedApi } from './hooks/useProtectedApi';
export { useDashboardData } from './hooks/useDashboardData';

// Authentication services
export { createPasskey, login } from './services/passkeyService';
export { authService } from './services/authenticationService';

// User services
export { userApiService } from './services/userApiService';

export type { LoginResponse } from './hooks/types';
