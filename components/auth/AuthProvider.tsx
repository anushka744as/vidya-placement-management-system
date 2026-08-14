'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    // Right after a Google OAuth redirect, the URL still carries the
    // exchange params (?code=... or #access_token=...). Calling
    // getSession() at that moment can resolve with session: null before
    // supabase-js finishes exchanging those params, which would
    // incorrectly report "logged out" and bounce the user back to login.
    // In that case, skip the eager getSession() call and let
    // onAuthStateChange's own resolution (after the exchange completes)
    // be the sole source of truth. On every other page load there are no
    // such params, so this stays on the original fast path.
    const hasOAuthParamsInUrl =
      typeof window !== 'undefined' &&
      (window.location.hash.includes('access_token') ||
        new URLSearchParams(window.location.search).has('code'));

    if (!hasOAuthParamsInUrl) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (ignore) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (ignore) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
