import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
import { MercadoPagoConfig, Preference } from 'mercadopago';
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

// Inicializar o Mercado Pago (a chave deve ser adicionada ao arquivo .env)
const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
const preference = new Preference(mercadopago);

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

    // Criar uma preferência de pagamento do Mercado Pago
    const preferenceData = await preference.create({
      body: {
        items: [
          {
            id: plan.id,
            title: plan.name,
            description: `${plan.credits} créditos - ${plan.description}`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: plan.price / 100, // Convertendo de centavos para reais
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/creditos?success=true`,
          failure: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/creditos?canceled=true`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/creditos?pending=true`
        },
        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook`,
        metadata: {
          userId: userId,
          planId: planId,
          credits: plan.credits.toString(),
        },
    },
    });

    return NextResponse.json({ preferenceId: preferenceData.id });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o pagamento' },
      { status: 500 }
    );
  }
}
