"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      try {
        setLoading(true);
        
        // Obter o código de autorização e o estado da URL
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const storedState = localStorage.getItem("oauth_state");
        
        // Verificar se o estado corresponde (proteção contra CSRF)
        if (!state || state !== storedState) {
          throw new Error("Estado inválido. Possível ataque CSRF.");
        }
        
        // Limpar o estado armazenado
        localStorage.removeItem("oauth_state");
        
        if (!code) {
          throw new Error("Código de autorização não encontrado.");
        }

        // Trocar o código por tokens de acesso e ID
        const response = await fetch("/api/auth/google-callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao processar autenticação");
        }

        const data = await response.json();
        
        // Após receber os dados do usuário do Google via nossa API,
        // o backend já deve ter criado/atualizado o usuário no Supabase
        // Agora vamos verificar se a autenticação foi bem-sucedida
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          // Se não houver sessão, tentar fazer login diretamente com o token do Google
          const { error: signInError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: 'https://roominai.vercel.app/'
            }
          });

          if (signInError) {
            throw new Error("Falha ao autenticar com o Supabase: " + signInError.message);
          }
        }

        // Redirecionar para a página inicial após autenticação bem-sucedida
        router.push("/");
      } catch (err: any) {
        console.error("Erro durante o callback de autenticação:", err);
        setError(err.message || "Ocorreu um erro durante a autenticação");
        // Redirecionar para a página de login em caso de erro
        router.push("/login?error=" + encodeURIComponent(err.message || "Erro de autenticação"));
      } finally {
        setLoading(false);
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Processando autenticação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
