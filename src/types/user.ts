export interface MikaUser {
  id: string;
  email?: string;
  name: string;
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

export type UpdateUserProfile = Partial<Omit<MikaUser, 'id' | 'created_at' | 'updated_at'>>;
