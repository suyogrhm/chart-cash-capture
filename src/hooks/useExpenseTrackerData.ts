import { useState, useEffect } from 'react';
import { Transaction, Category, Account, Budget } from '@/types/Transaction';
import { parseMessage } from '@/utils/messageParser';
import { toast } from '@/hooks/use-toast';

export const useExpenseTrackerData = () => {
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

  // Initialize default data
  useEffect(() => {
    const defaultCategories: Category[] = [
      { id: '1', name: 'Food & Dining', type: 'expense', color: '#EF4444', icon: '🍽️' },
      { id: '2', name: 'Transportation', type: 'expense', color: '#3B82F6', icon: '🚗' },
      { id: '3', name: 'Entertainment', type: 'expense', color: '#8B5CF6', icon: '🎮' },
      { id: '4', name: 'Bills & Utilities', type: 'expense', color: '#F59E0B', icon: '⚡' },
      { id: '5', name: 'Shopping', type: 'expense', color: '#EC4899', icon: '🛒' },
      { id: '6', name: 'Fuel', type: 'expense', color: '#059669', icon: '⛽' },
      { id: '7', name: 'Salary', type: 'income', color: '#10B981', icon: '💰' },
      { id: '8', name: 'Freelance', type: 'income', color: '#06B6D4', icon: '💼' },
    ];

    const defaultAccounts: Account[] = [
      { id: '1', name: 'Checking Account', type: 'checking', balance: 5000, color: '#3B82F6' },
      { id: '2', name: 'Savings Account', type: 'savings', balance: 15000, color: '#10B981' },
      { id: '3', name: 'Credit Card', type: 'credit', balance: -1500, color: '#EF4444' },
    ];

    setCategories(defaultCategories);
    setAccounts(defaultAccounts);

    // Load saved data
    const savedTransactions = localStorage.getItem('expense-tracker-transactions');
    const savedBudgets = localStorage.getItem('expense-tracker-budgets');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('expense-tracker-budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.originalMessage.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId === selectedAccount);
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

  const handleMessage = (message: string) => {
    const parsedTransaction = parseMessage(message);
    if (parsedTransaction) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...parsedTransaction,
        date: new Date().toISOString(),
        originalMessage: message,
        accountId: accounts[0]?.id
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      ...category
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleEditTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Transaction deleted",
      description: "The transaction has been removed from your records.",
    });
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

  const handleAddBudget = (budget: Omit<Budget, 'id' | 'spent'>) => {
    const newBudget: Budget = {
      id: Date.now().toString(),
      ...budget,
      spent: 0
    };
    setBudgets(prev => [...prev, newBudget]);
  };

  const handleAddAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      ...account
    };
    setAccounts(prev => [...prev, newAccount]);
    toast({
      title: "Account added",
      description: `${account.name} has been added to your accounts.`,
    });
  };

  const handleEditAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
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
