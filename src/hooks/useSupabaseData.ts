
import { useState, useEffect } from 'react';
import { Transaction, Category, Account, Budget } from '@/types/Transaction';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // Initialize default data for new users
  useEffect(() => {
    if (!user) return;

    const initializeUserData = async () => {
      // Check if user already has data
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      // If no categories exist, create default ones
      if (!existingCategories || existingCategories.length === 0) {
        const defaultCategories = [
          { name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: '🍽️' },
          { name: 'Transportation', type: 'expense', color: '#3B82F6', icon: '🚗' },
          { name: 'Entertainment', type: 'expense', color: '#8B5CF6', icon: '🎮' },
          { name: 'Bills & Utilities', type: 'expense', color: '#F59E0B', icon: '⚡' },
          { name: 'Shopping', type: 'expense', color: '#EC4899', icon: '🛒' },
          { name: 'Fuel', type: 'expense', color: '#059669', icon: '⛽' },
          { name: 'Salary', type: 'income', color: '#10B981', icon: '💰' },
          { name: 'Freelance', type: 'income', color: '#06B6D4', icon: '💼' },
        ];

        for (const category of defaultCategories) {
          await supabase.from('categories').insert({
            ...category,
            user_id: user.id
          });
        }
      }

      // Check if user already has accounts
      const { data: existingAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      // If no accounts exist, create default ones
      if (!existingAccounts || existingAccounts.length === 0) {
        const defaultAccounts = [
          { name: 'Savings Account', type: 'savings', balance: 15000, color: '#10B981' },
          { name: 'Checking Account', type: 'checking', balance: 5000, color: '#3B82F6' },
          { name: 'Debit Card', type: 'debit', balance: 2000, color: '#06B6D4' },
          { name: 'Credit Card', type: 'credit', balance: -1500, color: '#EF4444' },
        ];

        for (const account of defaultAccounts) {
          await supabase.from('accounts').insert({
            ...account,
            user_id: user.id
          });
        }
      }
    };

    initializeUserData();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      // Load accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      // Load budgets
      const { data: budgetsData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsData) setTransactions(transactionsData as Transaction[]);
      if (categoriesData) setCategories(categoriesData as Category[]);
      if (accountsData) setAccounts(accountsData as Account[]);
      if (budgetsData) setBudgets(budgetsData as Budget[]);
    };

    loadData();
  }, [user]);

  return {
    transactions,
    categories,
    accounts,
    budgets,
    setTransactions,
    setCategories,
    setAccounts,
    setBudgets,
  };
};
