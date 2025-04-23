"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../components/AuthProvider";
import Link from "next/link";
import Image from "next/image";

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

export default function CreditosPage() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const creditPackages: CreditPackage[] = [
    {
      id: 1,
      name: "Pacote Básico",
      credits: 50,
      price: 29.90
    },
    {
      id: 2,
      name: "Pacote Premium",
      credits: 150,
      price: 69.90,
      popular: true
    },
    {
      id: 3,
      name: "Pacote Profissional",
      credits: 500,
      price: 199.90
    }
  ];

  const handleSelectPackage = (id: number) => {
    setSelectedPackage(id);
  };

  const handlePurchase = () => {
    // Implementação futura para processamento de pagamento
    alert(`Compra do pacote ${selectedPackage} será processada em breve!`);
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center px-4 mt-12 sm:mt-20">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Comprar Créditos
        </h1>
        
        {!user ? (
          <div className="text-center p-8 border border-gray-200 rounded-xl shadow-md bg-white max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Faça login para comprar créditos</h2>
            <p className="text-gray-600 mb-6">Você precisa estar logado para adquirir créditos e usar todos os recursos do roomin.ai</p>
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {creditPackages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className={`relative flex flex-col p-6 bg-white rounded-2xl shadow-md border transition-all ${selectedPackage === pkg.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => handleSelectPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-0 right-0 mx-auto w-max px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      Mais Popular
                    </div>
                  )}
                  
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold mb-1">R$ {pkg.price.toFixed(2)}</div>
                  <p className="text-gray-500 mb-4">Pagamento único</p>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-lg font-semibold">{pkg.credits} créditos</span>
                  </div>
                  
                  <ul className="mb-6 flex-grow">
                    <li className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Redecoração de ambientes
                    </li>
                    <li className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Alta qualidade de imagem
                    </li>
                    <li className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Suporte prioritário
                    </li>
                  </ul>
                  
                  <button 
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${selectedPackage === pkg.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {selectedPackage === pkg.id ? 'Selecionado' : 'Selecionar'}
                  </button>
                </div>
              ))}
            </div>
            
            {selectedPackage && (
              <div className="flex justify-center">
                <button 
                  onClick={handlePurchase}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
