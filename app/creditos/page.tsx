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

// Importação do Stripe
import { loadStripe } from '@stripe/stripe-js';

// Definição dos planos de créditos
const creditPlans = [
  {
    id: 'basic',
    name: 'Plano Básico',
    credits: 10,
    price: 29.90,
    description: 'Ideal para pequenos projetos',
    features: ['10 redesenhos de ambientes', 'Acesso a todos os temas', 'Suporte por email']
  },
  {
    id: 'standard',
    name: 'Plano Padrão',
    credits: 25,
    price: 59.90,
    description: 'Perfeito para projetos médios',
    features: ['25 redesenhos de ambientes', 'Acesso a todos os temas', 'Suporte prioritário', 'Download em alta resolução']
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    credits: 60,
    price: 99.90,
    description: 'Para profissionais e projetos grandes',
    features: ['60 redesenhos de ambientes', 'Acesso a todos os temas', 'Suporte prioritário 24h', 'Download em alta resolução', 'Sem marca d\'água']
  }
];

// Inicializar o Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CreditosPage() {
  const { user, credits } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
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

  // Função para iniciar o checkout com Stripe
  const handleCheckout = async (planId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    setSelectedPlan(planId);
    setIsProcessing(true);
    setMessage('');

    try {
      // Fazer uma chamada para API do backend que cria uma sessão de checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, userId: user.id })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sessão de checkout');
      }
      
      // Redirecionar para a página de checkout do Stripe
      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message || 'Erro ao redirecionar para o checkout');
        }
      } else {
        throw new Error('Não foi possível carregar o Stripe');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      setMessage('Ocorreu um erro ao processar o pagamento. Por favor, tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex max-w-6xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-poppins text-4xl font-bold tracking-normal text-gray-800 sm:text-6xl mb-6">
            <span className="relative whitespace-nowrap text-blue-600">
              <SquigglyLines />
              <span className="relative">Adquira Créditos</span>
            </span>{" "}
            para Redesenhar seus Ambientes
          </h1>
          <p className="text-lg text-gray-600 leading-7 mb-10 text-center">
            Escolha o plano que melhor se adapta às suas necessidades e comece a transformar seus ambientes com a ajuda da inteligência artificial.
            Quanto mais créditos você adquirir, maior o desconto no valor unitário.
          </p>

          {message && (
            <div className="mb-8 p-4 bg-green-50 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {creditPlans.map((plan) => (
              <motion.div
                key={plan.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-6 flex flex-col items-center text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="text-blue-600 font-bold text-4xl mb-4">
                    R$ {plan.price.toFixed(2)}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6 w-full">
                    <div className="flex items-center justify-center bg-blue-50 rounded-full py-2 px-4 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">{plan.credits} créditos</span>
                    </div>
                    
                    <ul className="text-left space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isProcessing && selectedPlan === plan.id}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-500 hover:to-blue-400 transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    {isProcessing && selectedPlan === plan.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </>
                    ) : (
                      'Comprar Agora'
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Como funciona?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <motion.div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 rounded-full p-4 mb-4">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-center">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Perguntas Frequentes</h2>
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
