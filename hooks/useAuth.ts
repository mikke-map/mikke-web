import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  observeAuthState, 
  signInWithGoogle, 
  signInAnonymously, 
  signOut 
} from '../lib/firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = observeAuthState((user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await signInWithGoogle();
      // State will be updated by the observer
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'ログインに失敗しました',
      }));
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await signInAnonymously();
      // State will be updated by the observer
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'ログインに失敗しました',
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await signOut();
      // State will be updated by the observer
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'ログアウトに失敗しました',
      }));
    }
  };

  return {
    ...authState,
    signInWithGoogle: handleGoogleSignIn,
    signInAnonymously: handleAnonymousSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!authState.user,
    isAnonymous: authState.user?.isAnonymous || false,
  };
};