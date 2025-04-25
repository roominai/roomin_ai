import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { addCredits } from '../../../utils/creditSystem';

// Inicializar o Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

// Webhook secret para verificar assinatura
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature') || '';

    let event;

    // Verificar a assinatura do webhook
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Erro na assinatura do webhook:', err);
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
    }

    // Processar o evento
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extrair metadados da sessão
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0');

      if (userId && credits > 0) {
        // Adicionar créditos à conta do usuário
        const success = await addCredits(userId, credits);
        
        if (!success) {
          console.error('Falha ao adicionar créditos após pagamento:', { userId, credits });
          // Mesmo em caso de falha, retornamos 200 para o Stripe não reenviar o webhook
          // Mas registramos o erro para investigação posterior
        } else {
          console.log('Créditos adicionados com sucesso:', { userId, credits });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar webhook' },
      { status: 500 }
    );
  }
}
