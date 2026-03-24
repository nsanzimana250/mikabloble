import { supabase } from "@/supabase";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  country?: string;
  city?: string;
  address?: string;
  role: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User | null;
  profile: UserProfile | null;
  error: string | null;
}

// Allowed fields for profile updates (prevents role/id tampering)
const ALLOWED_UPDATE_FIELDS = ['name', 'phone', 'avatar', 'country', 'city', 'address'];

/**
 * Registers a new user with email and password
 */
export async function signUp(email: string, password: string, name: string): Promise<AuthResponse> {
  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) {
      return {
        user: null,
        profile: null,
        error: error.message
      };
    }

    if (!data.user) {
      return {
        user: null,
        profile: null,
        error: "Registration failed. Please try again."
      };
    }

    // Check if email confirmation is required
    if (data.user.confirmed_at === null) {
      return {
        user: data.user,
        profile: null,
        error: "Please confirm your email address before logging in."
      };
    }

     // Create user profile in MIKA_users table using the auth user ID
     // Note: password field is required by DB schema but not used (auth handled by Supabase)
     const profileData = {
       id: data.user.id,
       name,
       email,
       password: "", // Placeholder - actual auth handled by Supabase
       phone: null,
       avatar: null,
       country: null,
       city: null,
       address: null,
       role: 'customer',
       created_at: new Date().toISOString(),
       updated_at: new Date().toISOString()
     };

     const { data: profile, error: profileError } = await supabase
       .from('mika_users')
       .insert([profileData])
       .select()
       .single();

    if (profileError) {
      // Log the error but DON'T try to delete the auth user from client
      // This should be handled by a database trigger or scheduled cleanup
      console.error("Failed to create user profile:", profileError);
      return {
        user: data.user,
        profile: null,
        error: "Account created but profile setup failed. Please contact support."
      };
    }

    return {
      user: data.user,
      profile: profile as UserProfile,
      error: null
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      user: null,
      profile: null,
      error: "An unexpected error occurred. Please try again."
    };
  }
}

/**
 * Signs in a user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return {
        user: null,
        profile: null,
        error: error.message
      };
    }

    if (!data.user) {
      return {
        user: null,
        profile: null,
        error: "Sign in failed. Please try again."
      };
    }

    // Check if email is confirmed
    if (data.user.confirmed_at === null) {
      return {
        user: null,
        profile: null,
        error: "Please confirm your email address before logging in."
      };
    }

     // Fetch user profile from mika_users table using ID, not email
     const { data: profile, error: profileError } = await supabase
       .from('mika_users')
       .select('*')
       .eq('id', data.user.id)
       .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Profile fetch error:", profileError);
      return {
        user: data.user,
        profile: null,
        error: "Failed to load user profile."
      };
    }

     // If profile doesn't exist, create it (handles edge cases)
     if (!profile) {
       const newProfileData = {
         id: data.user.id,
         name: data.user.user_metadata?.name || email.split('@')[0],
         email: data.user.email,
         password: "", // Placeholder - actual auth handled by Supabase
         phone: null,
         avatar: null,
         country: null,
         city: null,
         address: null,
         role: 'customer',
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       };

       const { data: newProfile, error: insertError } = await supabase
         .from('mika_users')
         .insert([newProfileData])
         .select()
         .single();

       if (insertError) {
         console.error("Profile creation on login error:", insertError);
         return {
           user: data.user,
           profile: null,
           error: "User profile could not be loaded."
         };
       }

       // Update last_login for new profile
       await supabase
         .from('mika_users')
         .update({ last_login: new Date().toISOString() })
         .eq('id', newProfile.id);

       return {
         user: data.user,
         profile: newProfile as UserProfile,
         error: null
       };
     }

     // Update last_login for existing profile
     await supabase
       .from('mika_users')
       .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
       .eq('id', profile.id);

    return {
      user: data.user,
      profile: profile as UserProfile,
      error: null
    };
  } catch (error) {
    console.error("Signin error:", error);
    return {
      user: null,
      profile: null,
      error: "An unexpected error occurred. Please try again."
    };
  }
}

/**
 * Signs out the current user
 */
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return {
      error: error ? error.message : null
    };
  } catch (error) {
    console.error("Signout error:", error);
    return {
      error: "An unexpected error occurred. Please try again."
    };
  }
}

/**
 * Updates user profile with field whitelisting
 */
export async function updateProfile(profileData: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        profile: null,
        error: "No authenticated user found"
      };
    }

    // Sanitize input - only allow specific fields to be updated
    const sanitizedData: Partial<UserProfile> = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (profileData[field as keyof UserProfile] !== undefined) {
        sanitizedData[field as keyof UserProfile] = profileData[field as keyof UserProfile];
      }
    }

    // Add updated_at timestamp
    sanitizedData.updated_at = new Date().toISOString() as any;

    if (Object.keys(sanitizedData).length === 0) {
      return {
        profile: null,
        error: "No valid fields to update"
      };
    }

     const { data, error } = await supabase
       .from('mika_users')
       .update(sanitizedData)
       .eq('id', user.id)
       .select()
       .single();

    if (error) {
      console.error("Profile update error:", error);
      return {
        profile: null,
        error: error.message
      };
    }

    return {
      profile: data as UserProfile,
      error: null
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      profile: null,
      error: "An unexpected error occurred. Please try again."
    };
  }
}

/**
 * Gets current user session and profile
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        user: null,
        profile: null,
        error: null
      };
    }

     const { data: profile, error } = await supabase
       .from('mika_users')
       .select('*')
       .eq('id', user.id)
       .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Get current user error:", error);
      return {
        user,
        profile: null,
        error: error.message
      };
    }

    return {
      user,
      profile: profile as UserProfile || null,
      error: null
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return {
      user: null,
      profile: null,
      error: "An unexpected error occurred. Please try again."
    };
  }
}

/**
 * Checks if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch (error) {
    return false;
  }
}