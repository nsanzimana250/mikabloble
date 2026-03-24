import { useState, useEffect, useContext, createContext, useCallback } from "react";
import { type User } from "@supabase/supabase-js";
import { 
  getCurrentUser, 
  signIn as authSignIn, 
  signUp as authSignUp, 
  signOut as authSignOut, 
  updateProfile as authUpdateProfile, 
  type UserProfile 
} from "@/lib/auth";
import { supabase } from "@/supabase";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    // Set timeout to prevent loading from getting stuck
    if (loadingTimeout) clearTimeout(loadingTimeout);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second timeout
    setLoadingTimeout(timeout);
    
    try {
      const { user: newUser, profile: newProfile, error: authError } = await authSignIn(email, password);
      
      if (authError) {
        setError(authError);
      } else {
        setUser(newUser);
        setProfile(newProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    // Set timeout to prevent loading from getting stuck
    if (loadingTimeout) clearTimeout(loadingTimeout);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second timeout
    setLoadingTimeout(timeout);
    
    try {
      const { user: newUser, profile: newProfile, error: authError } = await authSignUp(email, password, name);
      
      if (authError) {
        setError(authError);
      } else {
        setUser(newUser);
        setProfile(newProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Set timeout to prevent loading from getting stuck
    if (loadingTimeout) clearTimeout(loadingTimeout);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second timeout
    setLoadingTimeout(timeout);
    
    try {
      const { error: authError } = await authSignOut();
      
      if (authError) {
        setError(authError);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      if (loadingTimeout) clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { profile: updatedProfile, error: authError } = await authUpdateProfile(data);
      
      if (authError) {
        setError(authError);
      } else if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state and set up listener
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { user: currentUser, profile: currentProfile, error: authError } = await getCurrentUser();
        
        if (isMounted) {
          if (authError) {
            setError(authError);
          } else {
            setUser(currentUser);
            setProfile(currentProfile);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to initialize authentication.");
          setLoading(false);
        }
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' && session) {
        // User signed in, fetch profile
        const { user: currentUser, profile: currentProfile, error: authError } = await getCurrentUser();
        if (authError) {
          setError(authError);
        } else {
          setUser(currentUser);
          setProfile(currentProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setUser(null);
        setProfile(null);
        setError(null);
      } else if (event === 'USER_UPDATED') {
        // User updated, refresh profile
        const { profile: currentProfile, error: authError } = await getCurrentUser();
        if (!authError && currentProfile) {
          setProfile(currentProfile);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};