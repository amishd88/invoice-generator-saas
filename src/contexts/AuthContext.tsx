/**
 * @deprecated This context is deprecated. 
 * Use the AuthContext and useAuth from '../services/auth/AuthContext' instead.
 */

import { useAuth as serviceUseAuth } from '../services/auth/AuthContext';

// Re-export for backward compatibility but log a deprecation warning
export const useAuth = () => {
  console.warn(
    '[DEPRECATED] Using deprecated AuthContext from /contexts/AuthContext. ' +
    'Please update your imports to use AuthContext from /services/auth/AuthContext instead.'
  );
  return serviceUseAuth();
};

// Re-export the provider as well
export { AuthProvider } from '../services/auth/AuthContext';
