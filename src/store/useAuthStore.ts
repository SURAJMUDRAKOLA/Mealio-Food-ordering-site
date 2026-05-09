import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  initialized: boolean;

  initialize: () => () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, 'name' | 'phone'>>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  initialized: false,

  initialize: () => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null, initialized: true });
      if (session?.user) get().fetchProfile();
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) get().fetchProfile();
      else set({ profile: null });
    });

    return () => subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      toast.success('Account created! Check your email to confirm.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      toast.error(msg);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
    toast.success('Signed out');
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) set({ profile: data as Profile });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);
    if (error) { toast.error(error.message); return; }
    set((state) => ({ profile: state.profile ? { ...state.profile, ...data } : null }));
    toast.success('Profile updated');
  },
}));

// ── Backward-compat shim: keeps useAuth() working in existing components ──────
export const useAuth = () => {
  const { user, profile, isLoading, signIn, signUp, signOut, initialized } = useAuthStore();
  return {
    // Map Supabase User → local User shape the components expect
    user: user && profile ? { id: user.id, name: profile.name, email: profile.email } : null,
    login: signIn,
    signup: (name: string, email: string, password: string) => signUp(name, email, password),
    logout: signOut,
    isLoading,
    error: null as string | null,
    initialized,
  };
};
