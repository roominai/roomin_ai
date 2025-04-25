import { NextResponse } from 'next/server';
import { supabase } from '../../../supabaseClient';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { addCredits } from '../../../utils/creditSystem';

// Preço por 10 créditos
const PRICE_PER_10_CREDITS = 15.00;

// Função para obter o nome do plano com base nos créditos
const getPlanName = (credits: number) => {
  if (credits <= 10) return 'Plano Básico';
  if (credits <= 30) return 'Plano Padrão';
  return 'Plano Premium';
};

// Função para obter a descrição do plano com base nos créditos
const getPlanDescription = (credits: number) => {
  if (credits <= 10) return 'Ideal para pequenos projetos';
  if (credits <= 30) return 'Perfeito para projetos médios';
  return 'Para profissionais e projetos grandes';
};

// Inicializar o Mercado Pago (a chave deve ser adicionada ao arquivo .env)
const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });
const preference = new Preference(mercadopago);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, userId, credits, price } = body;

    // Validar os créditos e preço
    if (!credits || credits < 10 || credits % 10 !== 0 || !price) {
      return NextResponse.json({ error: 'Quantidade de créditos ou preço inválido' }, { status: 400 });
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
            id: planId,
            title: getPlanName(credits),
            description: `${credits} créditos - ${getPlanDescription(credits)}`,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: price, // Preço já em reais
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
          credits: credits.toString(),
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
