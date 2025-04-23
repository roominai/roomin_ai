'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import { supabase } from '../../supabaseClient';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

type Profile = {
  id: string;
  email: string;
  credits: number;
  created_at: string;
};

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Redirecionar se não for admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  // Buscar perfis de usuários
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!isAdmin) return;
      
      setIsLoading(true);
      let query = supabase.from('profiles').select('*');
      
      if (searchTerm) {
        query = query.ilike('email', `%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar perfis:', error);
        setMessage({ text: 'Erro ao carregar usuários', type: 'error' });
      } else {
        setProfiles(data || []);
      }
      
      setIsLoading(false);
    };

    fetchProfiles();
  }, [isAdmin, searchTerm]);

  // Atualizar créditos de um usuário
  const updateCredits = async (userId: string, newCredits: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (error) throw error;
      
      // Atualizar a lista local
      setProfiles(profiles.map(profile => 
        profile.id === userId ? { ...profile, credits: newCredits } : profile
      ));
      
      setMessage({ text: 'Créditos atualizados com sucesso!', type: 'success' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
      setMessage({ text: 'Erro ao atualizar créditos', type: 'error' });
    }
  };

  // Se estiver carregando ou não for admin, mostrar mensagem de carregamento
  if (loading || !isAdmin) {
    return (
      <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
        <Header />
        <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
          <p>Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center px-4 mt-12 sm:mt-20">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>
        
        {/* Barra de pesquisa */}
        <div className="w-full max-w-2xl mb-8">
          <input
            type="text"
            placeholder="Pesquisar por email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* Mensagem de feedback */}
        {message.text && (
          <div className={`w-full max-w-2xl mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        {/* Tabela de usuários */}
        <div className="w-full max-w-4xl overflow-x-auto">
          {isLoading ? (
            <p className="text-center">Carregando usuários...</p>
          ) : profiles.length === 0 ? (
            <p className="text-center">Nenhum usuário encontrado</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left border">Email</th>
                  <th className="p-3 text-center border">Créditos</th>
                  <th className="p-3 text-center border">Data de Criação</th>
                  <th className="p-3 text-center border">Ações</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} className="border hover:bg-gray-50">
                    <td className="p-3 border">{profile.email}</td>
                    <td className="p-3 text-center border">{profile.credits}</td>
                    <td className="p-3 text-center border">
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-center border">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => updateCredits(profile.id, profile.credits - 1)}
                          disabled={profile.credits <= 0}
                          className="px-2 py-1 bg-red-500 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <button
                          onClick={() => updateCredits(profile.id, profile.credits + 1)}
                          className="px-2 py-1 bg-green-500 text-white rounded-md"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}