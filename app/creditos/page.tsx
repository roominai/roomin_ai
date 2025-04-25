'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { addCredits } from '../../utils/creditSystem';
import SquigglyLines from '../../components/SquigglyLines';

// Importação do Mercado Pago
import { initMercadoPago } from '@mercadopago/sdk-react';

// Preços fixos para cada plano
const BASIC_PRICE = 30.00;
const STANDARD_PRICE = 80.00;
const PREMIUM_PRICE = 150.00;

// Função para obter o preço com base nos créditos
const getPrice = (credits: number) => {
  if (credits === 20) return BASIC_PRICE;
  if (credits === 50) return STANDARD_PRICE;
  if (credits === 100) return PREMIUM_PRICE;
  return 0; // Caso não seja um dos planos predefinidos
};

// Função para obter o ID do plano com base nos créditos
const getPlanId = (credits: number) => {
  if (credits <= 10) return 'basic';
  if (credits <= 30) return 'standard';
  return 'premium';
};

// Benefícios baseados na quantidade de créditos
const getFeatures = (credits: number) => {
  const features = [
    `${credits} redesenhos de ambientes`,
    'Acesso a todos os temas',
  ];
  
  if (credits >= 20) {
    features.push('Suporte prioritário');
    features.push('Download em alta resolução');
  }
  
  if (credits >= 50) {
    features.push('Suporte prioritário 24h');
    features.push('Sem marca d\'água');
  }
  
  return features;
};

// Planos predefinidos
const creditPlans = [
  {
    id: 'basic',
    name: 'Básico',
    credits: 20,
    price: BASIC_PRICE,
    popular: false,
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-blue-50',
    features: getFeatures(20),
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'standard',
    name: 'Padrão',
    credits: 50,
    price: STANDARD_PRICE,
    popular: true,
    color: 'from-indigo-600 to-purple-700',
    bgColor: 'bg-indigo-50',
    features: getFeatures(50),
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    id: 'premium',
    name: 'Premium',
    credits: 100,
    price: PREMIUM_PRICE,
    popular: false,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    features: getFeatures(100),
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

// Inicializar o Mercado Pago
initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || '');

export default function CreditosPage() {
  const { user, credits } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState(creditPlans[1]); // Padrão como default
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  
  // Verificar parâmetros de URL para mensagens de sucesso/erro
  useEffect(() => {
    // Verificar se o pagamento foi bem-sucedido
    if (searchParams.get('success') === 'true') {
      setMessage('Pagamento processado com sucesso! Os créditos foram adicionados à sua conta.');
    }
    
    // Verificar se o pagamento foi cancelado
    if (searchParams.get('canceled') === 'true') {
      setMessage('O pagamento foi cancelado. Você pode tentar novamente quando quiser.');
    }
  }, [searchParams]);

  // Função para iniciar o checkout com Mercado Pago
  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      // Fazer uma chamada para API do backend que cria uma preferência de pagamento
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          planId: selectedPlan.id, 
          userId: user.id,
          credits: selectedPlan.credits,
          price: selectedPlan.price
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar preferência de pagamento');
      }
      
      // Redirecionar para a página de checkout do Mercado Pago
      const { preferenceId } = await response.json();
      
      // Redirecionar para o checkout do Mercado Pago
      window.location.href = `https://www.mercadopago.com.br/checkout/v1/redirect?preference-id=${preferenceId}`;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setMessage('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="font-poppins text-4xl font-bold tracking-normal text-gray-800 sm:text-6xl mb-6">
              <span className="relative whitespace-nowrap text-blue-600">
                <SquigglyLines />
                <span className="relative">Adquira Créditos</span>
              </span>{" "}
              <span className="block sm:inline">para Transformar seus Ambientes</span>
            </h1>
            <p className="text-xl text-gray-600 leading-7 mb-10 max-w-3xl mx-auto">
              Escolha o plano ideal para você e comece a redesenhar seus ambientes com a ajuda da nossa inteligência artificial avançada.
            </p>
          </motion.div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 shadow-sm max-w-3xl mx-auto"
            >
              {message}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {creditPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className={`relative rounded-2xl overflow-hidden border ${selectedPlan.id === plan.id ? (plan.id === 'premium' ? 'border-orange-500 ring-2 ring-orange-500 ring-opacity-50' : 'border-purple-500 ring-2 ring-purple-500 ring-opacity-50') : 'border-gray-200'} bg-white shadow-lg transition-all duration-300`}
                onClick={() => setSelectedPlan(plan)}
              >
                {plan.id === 'padrao' && (
                  <div className="trending-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                )}
                {/* Tarja POPULAR removida conforme solicitado */}
                <div className={`p-6 ${plan.bgColor}`}>
                  <div className="flex justify-center mb-4">
                    <div className={`rounded-full p-3 bg-white shadow-md`}>
                      {plan.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{plan.name}</h3>
                  <div className="text-gray-500 text-sm mb-4">{plan.credits} créditos</div>
                  <div className={`price-value bg-gradient-to-r ${plan.color} mb-1`}>
                    R$ {plan.price.toFixed(2)}
                  </div>
                  <div className="text-gray-500 text-sm mb-4">Pagamento único</div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600 text-left">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4">
                    <div 
                      className={`h-5 w-5 border-2 rounded-full ${selectedPlan.id === plan.id ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} mx-auto cursor-pointer transition-colors duration-200`}
                      onClick={() => setSelectedPlan(plan)}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-3xl mx-auto mb-16"
          >
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-100 pb-6">
              <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Compra selecionado</h3>
                <div className="flex items-center">
                  <div className={`rounded-full p-2 ${selectedPlan.bgColor} mr-2`}>
                    {selectedPlan.icon}
                  </div>
                  <span className="text-xl font-bold text-gray-800">{selectedPlan.name} - {selectedPlan.credits} créditos</span>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <div className={`price-value bg-gradient-to-r ${selectedPlan.color} mb-2`}>
                  R$ {selectedPlan.price.toFixed(2)}
                </div>
                <p className="text-gray-500 text-sm">Pagamento único</p>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center text-lg"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>Finalizar compra</>  
              )}
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-sm border border-blue-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Como funciona?</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    ),
                    title: "1. Escolha um plano",
                    description: "Selecione o plano que melhor atende às suas necessidades de redesenho."
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    title: "2. Faça o pagamento",
                    description: "Realize o pagamento de forma segura através do nosso gateway."
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    ),
                    title: "3. Receba seus créditos",
                    description: "Os créditos serão adicionados instantaneamente à sua conta após a confirmação do pagamento."
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-white rounded-full p-3 shadow-md mr-4 flex-shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-gray-800">
                        {step.title}
                      </h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Perguntas Frequentes</h2>
              <div className="space-y-4">
                {[
                  {
                    question: "Os créditos expiram?",
                    answer: "Não, seus créditos não expiram e ficarão disponíveis em sua conta até que sejam utilizados."
                  },
                  {
                    question: "Posso transferir créditos para outra conta?",
                    answer: "No momento, não é possível transferir créditos entre contas."
                  },
                  {
                    question: "Como posso acompanhar meu saldo de créditos?",
                    answer: "Seu saldo de créditos é exibido no cabeçalho do site quando você está logado."
                  },
                  {
                    question: "Quais formas de pagamento são aceitas?",
                    answer: "Aceitamos cartões de crédito, débito e PIX através da nossa plataforma de pagamento segura."
                  }
                ].map((faq, index) => {
                  const [isOpen, setIsOpen] = useState(false);
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full p-4 text-left bg-white hover:bg-blue-50 transition-colors duration-300 flex justify-between items-center"
                      >
                        <h3 className="text-lg font-semibold">{faq.question}</h3>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 text-blue-600 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white border-t border-gray-100">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 shadow-lg text-white text-center mb-12"
          >
            <h2 className="text-2xl font-bold mb-4">Pronto para transformar seus ambientes?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">Adquira seus créditos agora e comece a redesenhar seus espaços com a ajuda da nossa inteligência artificial avançada.</p>
            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="bg-white text-blue-600 font-medium py-3 px-8 rounded-lg hover:bg-blue-50 transition duration-300 shadow-md hover:shadow-lg inline-flex items-center"
            >
              {isProcessing ? 'Processando...' : 'Começar agora'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
