import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [credits, setCredits] = useState<number>(0);

  // Fechar o menu quando clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Buscar créditos do usuário e configurar subscription para atualizações em tempo real
  useEffect(() => {
    async function fetchUserCredits() {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();
        
        if (data && !error) {
          setCredits(data.credits || 0);
        } else if (error) {
          console.error('Erro ao buscar créditos:', error);
        }
      }
    }
    
    fetchUserCredits();
    
    // Configurar subscription para atualizações em tempo real dos créditos
    if (user) {
      const subscription = supabase
        .channel('profile-credits-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          console.log('Mudança detectada no perfil:', payload);
          if (payload.new && 'credits' in payload.new && payload.new.credits !== undefined) {
            setCredits(payload.new.credits);
          }
        })
        .subscribe();
        
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return (
    <header className="flex flex-col xs:flex-row justify-between items-center w-full mt-6 border-b pb-7 sm:px-4 px-2 border-gray-200 gap-2">
      <Link href="/" className="flex items-center space-x-2">
        <Image
          alt="logo roomin"
          src="/logoroomin1.png"
          className="sm:w-10 sm:h-10 w-9 h-9"
          width={60}
          height={60}
          style={{ objectFit: "contain" }}
        />
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">roomin.ai</span>
      </Link>
      <div>
        {user ? (
          <div className="relative" ref={menuRef}>
            <div className="flex items-center">
              {/* Exibição de créditos */}
              <div className="flex items-center mr-3 bg-blue-50 px-3 py-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-700">{credits}</span>
              </div>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center space-x-2 rounded-full border border-gray-200 p-1 hover:border-gray-300 transition"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <Image 
                  src="/default-avatar.svg" 
                  alt="Foto de perfil" 
                  width={36} 
                  height={36} 
                  className="rounded-full bg-white"
                />
            </button>
            </div>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical">
                  {user && (
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  )}
                  <Link 
                    href="/creditos" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Comprar Créditos
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                      role="menuitem"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Painel Admin
                    </Link>
                  )}
                  <Link 
                    href="/dream" 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" 
                    role="menuitem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Redecorar foto
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={async () => {
                      await signOut();
                      router.push("/login");
                      setIsMenuOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            className="flex max-w-fit items-center justify-center space-x-2 rounded-full border border-blue-600 text-white px-5 py-2 text-sm shadow-md hover:bg-blue-500 bg-blue-600 font-medium transition"
            href="/login"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="mr-1"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
            <p>Login</p>
          </Link>
        )}
      </div>
    </header>
  );
}
