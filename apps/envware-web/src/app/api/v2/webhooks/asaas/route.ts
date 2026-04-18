import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook do Asaas para confirmar pagamentos 🌸🚀
 * Documentação: https://docs.asaas.com/docs/webhooks
 */
export async function POST(request: Request) {
  try {
    // Em produção, verificar o 'asaas-access-token' no header para segurança
    const body = await request.json();
    const { event, payment } = body;

    console.log(`[ASAAS WEBHOOK] Evento recebido: ${event}`);

    // Focamos no evento de confirmação de pagamento
    if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
      const paymentLinkId = payment.paymentLinkId;

      if (!paymentLinkId) return NextResponse.json({ success: true });

      // 1. Localizar a transação vinculada a este link de pagamento
      const transaction = await prisma.transaction.findUnique({
        where: { externalId: paymentLinkId },
        include: { team: true }
      });

      if (!transaction || transaction.status === 'CONFIRMED') {
        return NextResponse.json({ success: true });
      }

      // 2. Aplicar o benefício conforme o tipo da compra
      await prisma.$transaction(async (tx) => {
        // Atualiza transação
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: 'CONFIRMED' }
        });

        if (transaction.teamId) {
          if (transaction.type === 'TEAM_EXTRA') {
            // Aumenta o limite de projetos do time
            await tx.team.update({
              where: { id: transaction.teamId },
              data: { 
                maxProjects: { increment: 5 }, // Exemplo: +5 projetos
                isPremium: true 
              }
            });
          } else if (transaction.type === 'USER_PACK') {
            // Aumenta o limite de usuários por projeto
            await tx.team.update({
              where: { id: transaction.teamId },
              data: { 
                maxUsersPerProject: { increment: 10 } // +10 usuários
              }
            });
          }
        }
      });

      console.log(`[ASAAS WEBHOOK] Benefício aplicado com sucesso para transação ${transaction.id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ASAAS WEBHOOK] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
