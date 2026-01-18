import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authApi } from '../api/auth';

export const AuthContext = createContext(null);

/**
 * Auth provider component that manages user authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authApi
      .me()
      .then((userData) => {
        setUser(userData);
        setError(null);
      })
      .catch((err) => {
        setUser(null);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Initiates login by redirecting to GitHub OAuth
   */
  const login = () => {
    authApi.login();
  };

  /**
   * Logs out the current user and clears state
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Continue with logout even if API call fails
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
