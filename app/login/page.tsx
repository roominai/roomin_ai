"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    // Gerar URL de estado para segurança
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('oauth_state', state);

    // Construir URL de redirecionamento
    const currentUrl = window.location.origin;
    const googleRedirectUri = `${currentUrl}/auth/callback`;
    
    // Construir URL de autorização do Google
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', '406745229864-83461986tukmlnis28bl9j6fh5irjp6n.apps.googleusercontent.com');
    googleAuthUrl.searchParams.append('redirect_uri', googleRedirectUri);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'email profile');
    googleAuthUrl.searchParams.append('state', state);
    googleAuthUrl.searchParams.append('prompt', 'select_account');
    
    setRedirectUrl(googleAuthUrl.toString());
  }, []);

  const handleGoogleLogin = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Redirecionar para a URL de autenticação do Google
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro durante o login");
      console.error("Erro de login:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <div className="flex flex-col items-center justify-center w-full max-w-md p-8 rounded-xl shadow-md bg-white border border-gray-200">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Entrar no roomin.ai
          </h1>
          
          {error && (
            <div className="w-full p-4 mb-6 text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center w-full py-3 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Entrar com Google
              </span>
            )}
          </button>
          
          <p className="text-sm text-gray-600 mt-6">
            Ao entrar, você concorda com nossos{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
