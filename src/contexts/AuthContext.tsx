import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/supabase";
import { User, Session } from "@supabase/supabase-js";
import { MikaUser } from "@/types/user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: MikaUser | null;
  loading: boolean;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<MikaUser>) => Promise<any>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MikaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);

  // Fetch user profile from mika_users table
  const fetchProfile = useCallback(async (userId: string): Promise<MikaUser | null> => {
    try {
      const { data, error } = await supabase
        .from("mika_users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("[Auth] Error fetching profile:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("[Auth] Fetch profile error:", err);
      return null;
    }
  }, []);

  // Create profile if it doesn't exist
  const createProfile = useCallback(async (user: User): Promise<MikaUser | null> => {
    try {
      const { data, error } = await supabase
        .from("mika_users")
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: "user",
          is_active: true,
          preferred_language: "en",
          currency: "RWF",
        })
        .select()
        .single();

      if (error) {
        console.error("[Auth] Error creating profile:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error("[Auth] Create profile error:", err);
      return null;
    }
  }, []);

  // Handle session and user state update
  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    console.log("[Auth] State change:", event, { 
      hasSession: !!session, 
      userId: session?.user?.id 
    });

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      // Fetch or create profile
      let userProfile = await fetchProfile(session.user.id);
      
      if (!userProfile) {
        console.log("[Auth] No profile found, creating...");
        userProfile = await createProfile(session.user);
      }
      
      setProfile(userProfile);
    } else {
      setProfile(null);
    }

    // 🔥 FIX: Always set loading false and authReady true after handling
    setLoading(false);
    setAuthReady(true);
    console.log("[Auth] Auth ready set to TRUE");
  }, [fetchProfile, createProfile]);

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      console.log("[Auth] Initializing...");
      
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[Auth] Session error:", sessionError.message);
        }

        if (mounted) {
          await handleAuthChange(session ? "INITIAL_SESSION" : "NO_SESSION", session);
        }
      } catch (err) {
        console.error("[Auth] Initialization error:", err);
        if (mounted) {
          setLoading(false);
          setAuthReady(true); // 🔥 FIX: Even on error, mark as ready
        }
      }
    };

    initializeAuth();

    // 🔥 FIX: Add a safety timeout - force authReady after 3 seconds
    timeoutId = setTimeout(() => {
      if (mounted && !authReady) {
        console.warn("[Auth] ⚠️ Force setting authReady after timeout");
        setLoading(false);
        setAuthReady(true);
      }
    }, 3000);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          await handleAuthChange(_event, session);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  // Sign in method
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("[Auth] Signing in:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[Auth] Sign in error:", error.message);
        setLoading(false);
        return { error };
      }

      // Session will be set by onAuthStateChange listener
      return { error: null };
    } catch (err) {
      console.error("[Auth] Sign in exception:", err);
      setLoading(false);
      return { error: err as Error };
    }
  };

  // Sign up method
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      setLoading(true);
      console.log("[Auth] Signing up:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });

      if (error) {
        console.error("[Auth] Sign up error:", error.message);
        setLoading(false);
        return { error };
      }

      console.log("[Auth] Sign up success:", data);
      return { error: null };
    } catch (err) {
      console.error("[Auth] Sign up exception:", err);
      setLoading(false);
      return { error: err as Error };
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      setLoading(true);
      console.log("[Auth] Signing out...");

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[Auth] Sign out error:", error.message);
        throw error;
      }

      // State cleared by onAuthStateChange
    } catch (err) {
      console.error("[Auth] Sign out exception:", err);
      setLoading(false);
      throw err;
    }
  };

  // Update profile method
  const updateProfile = async (updates: Partial<MikaUser>) => {
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("mika_users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  // Manual session refresh
  const refreshSession = async () => {
    try {
      console.log("[Auth] Refreshing session...");
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("[Auth] Refresh error:", error.message);
        throw error;
      }
      
      await handleAuthChange("REFRESH", session);
    } catch (err) {
      console.error("[Auth] Refresh exception:", err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    authReady,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshSession,
  };

  console.log("[Auth] Provider state:", { loading, authReady, hasUser: !!user });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};