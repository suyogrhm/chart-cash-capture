
import { useState, useEffect } from 'react';
import { Transaction, Category, Account, Budget } from '@/types/Transaction';
import { parseMessage } from '@/utils/messageParser';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSupabaseExpenseTracker = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

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
          { name: 'Checking Account', type: 'checking', balance: 5000, color: '#3B82F6' },
          { name: 'Savings Account', type: 'savings', balance: 15000, color: '#10B981' },
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

  // Load user data
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

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.original_message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.account_id === selectedAccount);
    }

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dateRange.from! && transactionDate <= dateRange.to!;
      });
    }

    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter(t => {
        const min = parseFloat(amountRange.min) || 0;
        const max = parseFloat(amountRange.max) || Infinity;
        return t.amount >= min && t.amount <= max;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedCategory, selectedAccount, selectedType, dateRange, amountRange]);

  const handleMessage = async (message: string, accountId?: string, paymentMethod?: string) => {
    if (!user) return;

    const parsedTransaction = parseMessage(message);
    if (parsedTransaction) {
      const newTransaction = {
        ...parsedTransaction,
        user_id: user.id,
        original_message: message,
        account_id: accountId || accounts[0]?.id,
        payment_method: paymentMethod as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other' | undefined
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add transaction",
          variant: "destructive",
        });
      } else if (data) {
        setTransactions(prev => [data as Transaction, ...prev]);
        toast({
          title: "Transaction added",
          description: `Added ${parsedTransaction.type} of $${parsedTransaction.amount}`,
        });
      }
    }
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    } else if (data) {
      setCategories(prev => [...prev, data as Category]);
    }
  };

  const handleEditTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    } else {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed from your records.",
      });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense-tracker-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your transaction data has been downloaded as a JSON file.",
    });
  };

  const handleAddBudget = async (budget: Omit<Budget, 'id' | 'spent'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budget, user_id: user.id, spent: 0 })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add budget",
        variant: "destructive",
      });
    } else if (data) {
      setBudgets(prev => [...prev, data as Budget]);
    }
  };

  const handleAddAccount = async (account: Omit<Account, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('accounts')
      .insert({ ...account, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive",
      });
    } else if (data) {
      setAccounts(prev => [...prev, data as Account]);
      toast({
        title: "Account added",
        description: `${account.name} has been added to your accounts.`,
      });
    }
  };

  const handleEditAccount = async (id: string, updates: Partial<Account>) => {
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    } else {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } else {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedType('all');
    setDateRange({});
    setAmountRange({ min: '', max: '' });
  };

  return {
    transactions,
    categories,
    accounts,
    budgets,
    filteredTransactions,
    searchTerm,
    selectedCategory,
    selectedAccount,
    selectedType,
    dateRange,
    amountRange,
    setSearchTerm,
    setSelectedCategory,
    setSelectedAccount,
    setSelectedType,
    setDateRange,
    setAmountRange,
    setCategories,
    setAccounts,
    setBudgets,
    handleMessage,
    handleAddCategory,
    handleEditTransaction,
    handleDeleteTransaction,
    handleExportData,
    handleAddBudget,
    handleAddAccount,
    handleEditAccount,
    handleDeleteAccount,
    clearFilters,
  };
};
