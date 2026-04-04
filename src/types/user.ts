export interface MikaUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_active: boolean;
  preferred_language: string;
  currency: string;
}

export interface UpdateUserProfile {
  name?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  avatar?: string;
  preferred_language?: string;
  currency?: string;
}