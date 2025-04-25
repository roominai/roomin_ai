import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { addCredits } from '../../../utils/creditSystem';

// Inicializar o Mercado Pago
const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '' });

// Webhook secret para verificar assinatura
const webhookSecret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
const payment = new Payment(mercadopago);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verificar se é uma notificação de pagamento do Mercado Pago
    if (body.action === 'payment.created' || body.action === 'payment.updated') {
      const paymentId = body.data.id;
      
      // Obter detalhes do pagamento
      const paymentData = await payment.get({ id: paymentId });
      
      // Verificar se o pagamento foi aprovado
      if (paymentData.status === 'approved') {
        // Extrair metadados do pagamento
        const userId = paymentData.metadata?.userId;
        const credits = parseInt(paymentData.metadata?.credits || '0');
        
        if (userId && credits > 0) {
          // Adicionar créditos à conta do usuário
          const success = await addCredits(userId, credits);
          
          if (!success) {
            console.error('Falha ao adicionar créditos após pagamento:', { userId, credits });
            // Mesmo em caso de falha, retornamos 200 para o Mercado Pago não reenviar o webhook
            // Mas registramos o erro para investigação posterior
          } else {
            console.log('Créditos adicionados com sucesso:', { userId, credits });
          }
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
