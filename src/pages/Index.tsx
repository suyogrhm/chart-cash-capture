
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpendingChart } from '@/components/SpendingChart';
import { MetricsCards } from '@/components/MetricsCards';
import { MessageInput } from '@/components/MessageInput';
import { EnhancedTransactionsList } from '@/components/EnhancedTransactionsList';
import { CategoriesManager } from '@/components/CategoriesManager';
import { TransactionFilters } from '@/components/TransactionFilters';
import { BudgetTracker } from '@/components/BudgetTracker';
import { parseMessage } from '@/utils/messageParser';
import { Transaction, Category, Account, Budget } from '@/types/Transaction';
import { toast } from '@/hooks/use-toast';

const Index = () => {
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
      { id: '6', name: 'Salary', type: 'income', color: '#10B981', icon: '💰' },
      { id: '7', name: 'Freelance', type: 'income', color: '#06B6D4', icon: '💼' },
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

  // Save to localStorage
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedType('all');
    setDateRange({});
    setAmountRange({ min: '', max: '' });
  };

  // Calculate metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentToEarnedRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const budget = 2000; // You can make this dynamic later

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Expense Tracker Pro
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced financial tracking with natural language processing
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <MessageInput onMessage={handleMessage} />
            <SpendingChart transactions={currentMonthTransactions} />
            <MetricsCards 
              totalIncome={totalIncome}
              budget={budget}
              spentToEarnedRatio={spentToEarnedRatio}
              totalExpenses={totalExpenses}
            />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedAccount={selectedAccount}
              onAccountChange={setSelectedAccount}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              amountRange={amountRange}
              onAmountRangeChange={setAmountRange}
              categories={categories}
              accounts={accounts}
              onClearFilters={clearFilters}
            />
            <EnhancedTransactionsList
              transactions={filteredTransactions}
              categories={categories}
              accounts={accounts}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onExportData={handleExportData}
            />
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetTracker
              budgets={budgets}
              categories={categories}
              onAddBudget={handleAddBudget}
              onUpdateBudget={(id, updates) => setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))}
              onDeleteBudget={(id) => setBudgets(prev => prev.filter(b => b.id !== id))}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesManager
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={(id, updates) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))}
              onDeleteCategory={(id) => setCategories(prev => prev.filter(c => c.id !== id))}
            />
          </TabsContent>

          <TabsContent value="accounts">
            <div className="text-center py-12 text-muted-foreground">
              <p>Account management coming soon!</p>
              <p className="text-sm">Multiple account support will be available in the next update.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
