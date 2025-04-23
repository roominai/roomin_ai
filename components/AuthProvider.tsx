"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter sessão atual
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Se o usuário estiver autenticado, sincronizar dados com o Supabase
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            avatar_url: session.user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
            credits: 1, // Adicionar créditos iniciais para novos usuários
          }, { onConflict: 'id' });
          
        if (error) {
          console.error('Erro ao sincronizar perfil:', error);
        }
      }
      
      setLoading(false);
    };

    getSession();

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se o usuário estiver autenticado, sincronizar dados com o Supabase
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
            
          if (error) {
            console.error('Erro ao sincronizar perfil:', error);
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
