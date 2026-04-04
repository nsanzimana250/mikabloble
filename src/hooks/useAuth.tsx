import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { User } from '@supabase/supabase-js';
import { MikaUser } from '@/types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<MikaUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('mika_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      } else if (data) {
        return data;
      }
      return null;
    } catch (err) {
      console.error('Fetch profile error:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user) {
          if (mounted) {
            setUser(session.user);
          }
          
          // Fetch profile
          const userProfile = await fetchProfile(session.user.id);
          
          if (mounted) {
            if (userProfile) {
              setProfile(userProfile);
            } else {
              // Try to create profile if it doesn't exist
              const { data: newProfile, error: insertError } = await supabase
                .from('mika_users')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  role: 'user',
                  is_active: true,
                  preferred_language: 'en',
                  currency: 'RWF'
                })
                .select()
                .single();

              if (!insertError && newProfile) {
                setProfile(newProfile);
              }
            }
            setLoading(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userProfile = await fetchProfile(session.user.id);
          if (userProfile) {
            setProfile(userProfile);
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: Partial<MikaUser>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('mika_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setProfile(null);
      setUser(null);
      // Force redirect to login
      window.location.href = "/login";
    }
  };

  return {
    user,
    profile,
    loading,
    updateProfile,
    signOut,
  };
};