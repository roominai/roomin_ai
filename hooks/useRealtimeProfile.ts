'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

type ProfileData = {
  id: string;
  credits: number;
  is_admin: boolean;
  email?: string;
  avatar_url?: string;
  [key: string]: any; // Para outros campos que possam existir
};

/**
 * Hook personalizado para gerenciar atualizações em tempo real do perfil do usuário
 * @param user Objeto de usuário do Supabase Auth
 * @param initialData Dados iniciais do perfil (opcional)
 * @returns Objeto com dados do perfil e funções para manipulá-los
 */
export function useRealtimeProfile(user: User | null, initialData?: Partial<ProfileData>) {
  const [profile, setProfile] = useState<ProfileData | null>(initialData as ProfileData || null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Buscar dados do perfil
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        console.log('Perfil carregado do banco:', data);
        console.log('Status de admin do perfil:', data?.is_admin);
        setProfile(data);
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Configurar subscription para atualizações em tempo real
    const subscription = supabase
      .channel(`profile-updates-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        console.log('Perfil atualizado:', payload);
        if (payload.eventType === 'DELETE') {
          setProfile(null);
        } else {
          setProfile(payload.new as ProfileData);
        }
      })
      .subscribe((status) => {
        console.log(`Status da subscription do perfil: ${status}`);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Função para atualizar créditos
  const updateCredits = async (newCredits: number): Promise<boolean> => {
    if (!user || !profile) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao atualizar créditos:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  };

  return {
    profile,
    loading,
    error,
    updateCredits,
    // Getter para facilitar o acesso aos créditos
    get credits() {
      return profile?.credits || 0;
    },
    // Getter para facilitar a verificação de admin
    get isAdmin() {
      const adminStatus = profile?.is_admin || false;
      console.log('Verificação de admin retornando:', adminStatus);
      return adminStatus;
    }
  };
}
