import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

// Get environment variables with fallback values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mctmuhvjhlzduutcjwap.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdG11aHZqaGx6ZHV1dGNqd2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTE0OTgsImV4cCI6MjA4NjM4NzQ5OH0.QSVVQswhx3taOHNJU2Dfy555HM-BWb57atgzJRwY9Q4';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1jdG11aHZqaGx6ZHV1dGNqd2FwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgxMTQ5OCwiZXhwIjoyMDg2Mzg3NDk4fQ.7zMnRair65JfHeg2uXYYAhuAjSaYtRmXYVzZ7eideTc';

// Default client options
const defaultOptions: SupabaseClientOptions<any> = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Info': 'vite_react_shadcn_ts/1.0.0'
    }
  }
};

// Main client instance for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, defaultOptions);

// Cache for authenticated clients
const authenticatedClients = new Map<string, any>();

/**
 * Creates or retrieves a cached authenticated Supabase client instance
 * @param sessionToken - The session token from the authenticated user
 * @returns Authenticated Supabase client instance
 */
export const createAuthenticatedSupabaseClient = (sessionToken: string): any => {
  if (authenticatedClients.has(sessionToken)) {
    return authenticatedClients.get(sessionToken)!;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    ...defaultOptions,
    global: {
      ...defaultOptions.global,
      headers: {
        ...defaultOptions.global.headers,
        Authorization: `Bearer ${sessionToken}`
      }
    }
  });

  authenticatedClients.set(sessionToken, client);
  return client;
};

// Cache for service role client
let serviceRoleClient: any = null;

/**
 * Creates or retrieves a cached service role Supabase client instance
 * This client bypasses RLS policies and should only be used in secure environments
 * @returns Service role Supabase client instance
 */
export const createServiceRoleSupabaseClient = (): any => {
  if (serviceRoleClient) {
    return serviceRoleClient;
  }

  serviceRoleClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    ...defaultOptions,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  return serviceRoleClient;
};

// Helper function to clear authenticated client cache
export const clearAuthenticatedClientCache = (sessionToken?: string): void => {
  if (sessionToken) {
    authenticatedClients.delete(sessionToken);
  } else {
    authenticatedClients.clear();
  }
};

// Helper function to check if environment variables are properly configured
export const validateSupabaseConfig = (): boolean => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);
  
  if (missingVars.length > 0) {
    console.warn('Missing Supabase environment variables:', missingVars);
    return false;
  }

  return true;
};

// Validate configuration on module load
validateSupabaseConfig();
