import { createContext, useContext, ReactNode } from "react";
import { useAuth as useAuthHook } from "@/hooks/useAuth";
import { MikaUser } from "@/types/user";

interface AuthContextType {
  user: any;
  profile: MikaUser | null;
  loading: boolean;
  updateProfile: (updates: Partial<MikaUser>) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthHook();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};