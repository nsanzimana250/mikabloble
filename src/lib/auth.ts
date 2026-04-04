import { supabase } from '@/supabase';
import { MikaUser, UpdateUserProfile } from '@/types/user';

export const auth = {
  async signUp(email: string, password: string, name: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: window.location.origin + '/login'
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Signup exception:', err);
      return { data: null, error: err };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Signin error:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('Signin exception:', err);
      return { data: null, error: err };
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getProfile(userId: string): Promise<MikaUser | null> {
    try {
      const { data, error } = await supabase
        .from('mika_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Get profile exception:', err);
      return null;
    }
  },

  async updateProfile(userId: string, updates: UpdateUserProfile) {
    try {
      const { data, error } = await supabase
        .from('mika_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      console.error('Update profile exception:', err);
      return { data: null, error: err };
    }
  },
};