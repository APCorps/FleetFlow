// Manages FleetFlow authentication, JWT storage, session restoration, and login transitions.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  justLoggedIn: boolean;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  completeLoginTransition: () => void;
}

const AUTH_USER_KEY = '@fleetflow_auth_user';
const AUTH_TOKEN_KEY = '@fleetflow_auth_token';

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [justLoggedIn, setJustLoggedIn] =
    useState(false);

  /*
   * Restore the previous authentication session.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser =
          await AsyncStorage.getItem(
            AUTH_USER_KEY,
          );

        const storedToken =
          await AsyncStorage.getItem(
            AUTH_TOKEN_KEY,
          );

        /*
         * Only restore the session when both
         * user information and JWT exist.
         */
        if (storedUser && storedToken) {
          const parsedUser: User =
            JSON.parse(storedUser);

          setUser(parsedUser);

          /*
           * Restored sessions should not trigger
           * the Welcome Back animation.
           */
          setJustLoggedIn(false);
        }
      } catch (error) {
        console.error(
          'Failed to restore authentication session:',
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  /*
   * Performs a real login against the FastAPI backend.
   */
  const login = async (
    username: string,
    password: string,
  ) => {

    /*
     * Call FastAPI /auth/login.
     */
    const data = await api.login(
      username,
      password,
    );

    /*
     * Store the JWT securely enough for this
     * development stage using AsyncStorage.
     */
    await AsyncStorage.setItem(
      AUTH_TOKEN_KEY,
      data.access_token,
    );

    /*
     * Our current frontend expects a User
     * object containing an email field.
     *
     * We temporarily store the username here
     * so existing navigation/screens continue
     * working without a larger refactor.
     */
    const newUser: User = {
      email: username,
    };

    setUser(newUser);

    /*
     * Tell the navigator that this was a
     * fresh login.
     */
    setJustLoggedIn(true);

    await AsyncStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(newUser),
    );
  };

  /*
   * Called after the Welcome Back screen
   * finishes its transition.
   */
  const completeLoginTransition = () => {
    setJustLoggedIn(false);
  };

  /*
   * Logs the user out and removes both the
   * stored user information and JWT.
   */
  const logout = async () => {
    setUser(null);
    setJustLoggedIn(false);

    await AsyncStorage.removeItem(
      AUTH_USER_KEY,
    );

    await AsyncStorage.removeItem(
      AUTH_TOKEN_KEY,
    );
  };

  const isAuthenticated =
    user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        justLoggedIn,
        login,
        logout,
        completeLoginTransition,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth =
  (): AuthContextType => {
    const context =
      useContext(AuthContext);

    if (!context) {
      throw new Error(
        'useAuth must be used inside an AuthProvider',
      );
    }

    return context;
  };