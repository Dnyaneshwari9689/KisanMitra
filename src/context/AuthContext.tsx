import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, mobile: string, extraFields?: Record<string, string>) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    (async () => {
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    })();
  });

  return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    }
    setProfile(data as Profile | null);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    mobile: string,
    extraFields?: Record<string, string>,
  ) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    const userId = data.user?.id;
    if (!userId) return { error: 'Failed to create user account.' };

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: fullName,
      role,
      mobile,
    });

    if (profileError) return { error: profileError.message };

    // Insert role-specific data
    if (role === 'farmer') {
      const { error: farmerError } = await supabase.from('farmers').insert({
        user_id: userId,
        full_name: fullName,
        mobile,
        email,
        village: extraFields?.village ?? '',
        district: extraFields?.district ?? '',
        state: extraFields?.state ?? '',
        pincode: extraFields?.pincode ?? '',
      });
      if (farmerError) return { error: farmerError.message };
    } else if (role === 'buyer') {
      const { error: buyerError } = await supabase.from('buyers').insert({
        user_id: userId,
        business_name: extraFields?.businessName ?? fullName,
        owner_name: extraFields?.ownerName ?? fullName,
        mobile,
        email,
        business_location: extraFields?.businessLocation ?? '',
        buyer_type: extraFields?.buyerType ?? 'Wholesaler',
      });
      if (buyerError) return { error: buyerError.message };
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }

  async function refreshProfile() {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
