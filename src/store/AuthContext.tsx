import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  justLoggedIn: boolean;

  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  completeLoginTransition: () => void;
}

const AUTH_USER_KEY = '@fleetflow_auth_user';

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

  /*
   * true only when the user has just completed
   * a fresh login.
   *
   * It remains false when a previous session
   * is restored from AsyncStorage.
   */
  const [justLoggedIn, setJustLoggedIn] =
    useState(false);

  /*
   * Restore existing authentication session.
   */
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser =
          await AsyncStorage.getItem(
            AUTH_USER_KEY,
          );

        if (storedUser) {
          const parsedUser: User =
            JSON.parse(storedUser);

          setUser(parsedUser);

          /*
           * Important:
           * Restored sessions should NOT trigger
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
   * Fresh login.
   */
  const login = async (email: string) => {
    const newUser: User = {
      email,
    };

    setUser(newUser);

    /*
     * Tell the navigator this was a fresh login.
     */
    setJustLoggedIn(true);

    await AsyncStorage.setItem(
      AUTH_USER_KEY,
      JSON.stringify(newUser),
    );
  };

  /*
   * Called after Welcome Back finishes.
   *
   * This removes the fresh-login state so
   * the Dashboard becomes the normal screen.
   */
  const completeLoginTransition = () => {
    setJustLoggedIn(false);
  };

  /*
   * Logout.
   */
  const logout = async () => {
    setUser(null);
    setJustLoggedIn(false);

    await AsyncStorage.removeItem(
      AUTH_USER_KEY,
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