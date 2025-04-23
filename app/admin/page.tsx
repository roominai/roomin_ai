"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../components/AuthProvider";
import { supabase } from "../../supabaseClient";
import Image from "next/image";

// Verificar se a tabela admin_panel existe e criar um registro inicial se necessário
async function ensureAdminPanelSetup(userId: string) {
  try {
    const { error } = await supabase
      .from('admin_panel')
      .upsert({
        admin_id: userId,
        last_update: new Date().toISOString()
      }, { onConflict: 'admin_id' });
      
    if (error) {
      console.error('Erro ao configurar painel admin:', error);
    }
  } catch (err) {
    console.error('Erro ao verificar tabela admin_panel:', err);
  }
}

type User = {
  id: string;
  email: string;
  credits: number;
  avatar_url: string | null;
};

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creditsToAdd, setCreditsToAdd] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<string | null>(null); // Para indicar qual usuário está sendo atualizado
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    // Redirecionar se não for admin ou não estiver logado
    if (!loading && (!user || !isAdmin)) {
      router.push("/");
    } else if (user && isAdmin) {
      fetchUsers();
      
      // Configurar subscription para atualizações em tempo real usando a tabela admin_panel
      const subscription = supabase
        .channel('admin-panel-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'admin_panel'
        }, (payload) => {
          console.log('Mudança detectada no painel admin:', payload);
          // Forçar atualização imediata dos dados
          fetchUsers(); // Atualizar a lista quando houver mudanças
        })
        .subscribe((status) => {
          console.log('Status da subscription admin_panel:', status);
        });

      // Manter também a subscription na tabela profiles para garantir compatibilidade
      const profilesSubscription = supabase
        .channel('admin-profiles-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, (payload) => {
          console.log('Mudança detectada em profiles:', payload);
          fetchUsers();
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
        profilesSubscription.unsubscribe();
      };
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (users.length > 0) {
      const results = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(results);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Adicionar um parâmetro de cache-busting para forçar uma nova consulta
      const timestamp = new Date().getTime();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, credits, avatar_url')
        .order('email')
        .limit(100); // Limitar para melhorar o desempenho

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        return;
      }

      console.log(`Dados obtidos em ${timestamp}:`, data);
      setUsers(data || []);
      setFilteredUsers(data || []);
      console.log('Dados atualizados com sucesso');
      
      // Mostrar notificação quando os dados forem atualizados via subscription
      if (!isLoading) {
        setNotification({message: 'Dados atualizados com sucesso!', type: 'success'});
        // Limpar a notificação após 3 segundos
        setTimeout(() => setNotification(null), 3000);
      }
      
      // Atualizar a tabela admin_panel para manter o registro de última atualização
      if (user && isAdmin) {
        await supabase
          .from('admin_panel')
          .upsert({
            admin_id: user.id,
            last_update: new Date().toISOString()
          }, { onConflict: 'admin_id' });
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreditChange = (userId: string, value: string) => {
    setCreditsToAdd(prev => ({
      ...prev,
      [userId]: value
    }));
  };

  const addCredits = async (userId: string) => {
    const creditsValue = parseInt(creditsToAdd[userId] || "0");
    if (isNaN(creditsValue)) return;

    setUpdating(userId); // Indicar que este usuário está sendo atualizado
    try {
      // Primeiro, obter os créditos atuais do usuário
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar créditos do usuário:', fetchError);
        return;
      }

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + creditsValue;

      // Atualizar os créditos do usuário
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar créditos:', error);
        return;
      }

      // Atualizar também a tabela admin_panel para disparar a subscription
      if (user && isAdmin) {
        const { error: adminError } = await supabase
          .from('admin_panel')
          .upsert({
            admin_id: user.id,
            last_update: new Date().toISOString()
          }, { onConflict: 'admin_id' });

        if (adminError) {
          console.error('Erro ao atualizar painel admin:', adminError);
        }
      }

      // Limpar o campo de entrada
      setCreditsToAdd(prev => ({
        ...prev,
        [userId]: ""
      }));

    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
    } finally {
      setUpdating(null); // Remover indicador de atualização
    }
  };

  const removeCredits = async (userId: string) => {
    const creditsValue = parseInt(creditsToAdd[userId] || "0");
    if (isNaN(creditsValue)) return;

    setUpdating(userId); // Indicar que este usuário está sendo atualizado
    try {
      // Primeiro, obter os créditos atuais do usuário
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Erro ao buscar créditos do usuário:', fetchError);
        return;
      }

      const currentCredits = userData?.credits || 0;
      const newCredits = Math.max(0, currentCredits - creditsValue); // Não permitir créditos negativos

      // Atualizar os créditos do usuário
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (error) {
        console.error('Erro ao atualizar créditos:', error);
        return;
      }

      // Atualizar também a tabela admin_panel para disparar a subscription
      if (user && isAdmin) {
        const { error: adminError } = await supabase
          .from('admin_panel')
          .upsert({
            admin_id: user.id,
            last_update: new Date().toISOString()
          }, { onConflict: 'admin_id' });

        if (adminError) {
          console.error('Erro ao atualizar painel admin:', adminError);
        }
      }

      // Limpar o campo de entrada
      setCreditsToAdd(prev => ({
        ...prev,
        [userId]: ""
      }));

    } catch (error) {
      console.error('Erro ao remover créditos:', error);
    } finally {
      setUpdating(null); // Remover indicador de atualização
    }
  };

  if (loading) {
    return (
      <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
        <Header />
        <main className="flex flex-1 w-full flex-col items-center justify-center px-4 mt-12 sm:mt-20">
          <div className="text-center">Carregando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center px-4 mt-12 sm:mt-20">
        {notification && (
          <div className={`w-full max-w-4xl mb-4 p-4 rounded-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.message}
          </div>
        )}
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Painel de Administrador
        </h1>

        <div className="w-full max-w-4xl bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar usuário por email
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o email do usuário"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Créditos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatar_url ? (
                                <Image
                                  src={user.avatar_url}
                                  alt="Avatar"
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <Image
                                  src="/default-avatar.svg"
                                  alt="Avatar"
                                  width={40}
                                  height={40}
                                  className="rounded-full bg-white"
                                />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.credits}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              min="1"
                              value={creditsToAdd[user.id] || ""}
                              onChange={(e) => handleCreditChange(user.id, e.target.value)}
                              placeholder="Qtd"
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                            />
                            <button
                              onClick={() => addCredits(user.id)}
                              disabled={updating === user.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user.id ? '...' : '+'}
                            </button>
                            <button
                              onClick={() => removeCredits(user.id)}
                              disabled={updating === user.id}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user.id ? '...' : '-'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        {searchTerm ? "Nenhum usuário encontrado com esse email." : "Nenhum usuário cadastrado."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
