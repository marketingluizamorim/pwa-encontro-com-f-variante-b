import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');

      // Set up auth state listener FIRST
      const { data: { subscription } } = supabaseRuntime.auth.onAuthStateChange(
        async (_event, session) => {
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Update last_active_at when user session is active
            if (session?.user) {
              try {
                await supabaseRuntime
                  .from('profiles')
                  .update({ last_active_at: new Date().toISOString() })
                  .eq('user_id', session.user.id);
              } catch {
                // Non-critical, ignore errors
              }
            }
          }
        }
      );

      // Then get initial session
      const { data: { session: initialSession } } = await supabaseRuntime.auth.getSession();
      if (mounted) {
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setLoading(false);
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {


    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { error } = await supabaseRuntime.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {


    try {
      const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
      const { error } = await supabaseRuntime.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    const { supabaseRuntime } = await import('@/integrations/supabase/runtimeClient');
    await supabaseRuntime.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
