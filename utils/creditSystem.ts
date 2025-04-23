/**
 * Sistema de gerenciamento de créditos
 * Este arquivo centraliza as funções relacionadas ao sistema de créditos
 * e verificação de administrador do Roomin.ai
 */

import { supabase } from '../supabaseClient';

// Email do administrador padrão do sistema
const ADMIN_EMAIL = 'contato.roomin.ai@gmail.com';

/**
 * Verifica se um usuário é administrador
 * @param userId ID do usuário ou objeto de usuário com propriedade id
 * @returns Promise<boolean> true se o usuário for administrador, false caso contrário
 */
export async function isUserAdmin(userId: string | { id: string }): Promise<boolean> {
  try {
    const id = typeof userId === 'string' ? userId : userId.id;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data?.is_admin || false;
  } catch (error) {
    console.error('Erro ao verificar status de administrador:', error);
    return false;
  }
}

/**
 * Obtém o saldo de créditos de um usuário
 * @param userId ID do usuário
 * @returns Promise<number> Número de créditos disponíveis
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data?.credits || 0;
  } catch (error) {
    console.error('Erro ao obter créditos do usuário:', error);
    return 0;
  }
}

/**
 * Atualiza o saldo de créditos de um usuário
 * @param userId ID do usuário
 * @param newCredits Novo valor de créditos
 * @returns Promise<boolean> true se a atualização foi bem-sucedida, false caso contrário
 */
export async function updateUserCredits(userId: string, newCredits: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao atualizar créditos do usuário:', error);
    return false;
  }
}

/**
 * Debita créditos de um usuário (para uso em transações)
 * @param userId ID do usuário
 * @param amount Quantidade de créditos a debitar (valor positivo)
 * @returns Promise<boolean> true se o débito foi bem-sucedido, false caso contrário
 */
export async function debitCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    // Verificar saldo atual
    const currentCredits = await getUserCredits(userId);
    
    // Verificar se há créditos suficientes
    if (currentCredits < amount) {
      return false;
    }
    
    // Atualizar o saldo de créditos
    return await updateUserCredits(userId, currentCredits - amount);
  } catch (error) {
    console.error('Erro ao debitar créditos:', error);
    return false;
  }
}

/**
 * Adiciona créditos a um usuário (para compras ou bonificações)
 * @param userId ID do usuário
 * @param amount Quantidade de créditos a adicionar
 * @returns Promise<boolean> true se a adição foi bem-sucedida, false caso contrário
 */
export async function addCredits(userId: string, amount: number): Promise<boolean> {
  try {
    const currentCredits = await getUserCredits(userId);
    return await updateUserCredits(userId, currentCredits + amount);
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    return false;
  }
}

/**
 * Verifica se um usuário tem créditos suficientes para uma operação
 * @param userId ID do usuário
 * @param requiredAmount Quantidade de créditos necessários (padrão: 1)
 * @returns Promise<boolean> true se o usuário tem créditos suficientes, false caso contrário
 */
export async function hasEnoughCredits(userId: string, requiredAmount: number = 1): Promise<boolean> {
  try {
    const credits = await getUserCredits(userId);
    return credits >= requiredAmount;
  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    return false;
  }
}