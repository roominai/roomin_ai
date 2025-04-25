import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
import Stripe from 'stripe';
import { addCredits } from '../../../utils/creditSystem';

// Definição dos planos de créditos (deve corresponder aos da página de créditos)
const creditPlans = [
  {
    id: 'basic',
    name: 'Plano Básico',
    credits: 10,
    price: 2990, // Em centavos para o Stripe
    description: 'Ideal para pequenos projetos'
  },
  {
    id: 'standard',
    name: 'Plano Padrão',
    credits: 25,
    price: 5990, // Em centavos para o Stripe
    description: 'Perfeito para projetos médios'
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    credits: 60,
    price: 9990, // Em centavos para o Stripe
    description: 'Para profissionais e projetos grandes'
  }
];

// Inicializar o Stripe (a chave deve ser adicionada ao arquivo .env)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil', // Usar a versão mais recente da API
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, userId } = body;

    // Verificar se o plano existe
    const plan = creditPlans.find(p => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 400 });
    }

    // Verificar se o usuário existe
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 400 });
    }

    // Criar uma sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
              description: `${plan.credits} créditos - ${plan.description}`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/creditos?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/creditos?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId,
        credits: plan.credits.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o pagamento' },
      { status: 500 }
    );
  }
}
