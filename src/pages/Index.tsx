import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from '@/components/DashboardTab';
import { TransactionsTab } from '@/components/TransactionsTab';
import { CategoriesManager } from '@/components/CategoriesManager';
import { BudgetTracker } from '@/components/BudgetTracker';
import { AppLayout } from '@/components/AppLayout';
import { useExpenseTrackerData } from '@/hooks/useExpenseTrackerData';
import { AccountsManager } from '@/components/AccountsManager';

const Index = () => {
  const {
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
  } = useExpenseTrackerData();

  // Calculate metrics for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  // Filter transactions for last 3 days for dashboard
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= threeDaysAgo;
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
    <AppLayout>
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab
            onMessage={handleMessage}
            currentMonthTransactions={currentMonthTransactions}
            recentTransactions={recentTransactions}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            spentToEarnedRatio={spentToEarnedRatio}
            budget={budget}
            accounts={accounts}
          />
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionsTab
            filteredTransactions={filteredTransactions}
            categories={categories}
            accounts={accounts}
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
            onClearFilters={clearFilters}
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
          <AccountsManager
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Index;
