import { supabase } from './supabaseClient'

export async function getTransactions(user_email: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_email', user_email)
    .order('date', { ascending: false })
  return { data, error }
}

export async function addTransaction(transaction: any) {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
  return { data, error }
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
  return { error }
} 