
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DashboardTab } from '@/components/DashboardTab';
import { TransactionsTab } from '@/components/TransactionsTab';
import { CategoriesManager } from '@/components/CategoriesManager';
import { EnhancedBudgetTracker } from '@/components/EnhancedBudgetTracker';
import { RecurringTransactionsManager } from '@/components/RecurringTransactionsManager';
import { AppLayout } from '@/components/AppLayout';
import { useSupabaseExpenseTracker } from '@/hooks/useSupabaseExpenseTracker';
import { AccountsManager } from '@/components/AccountsManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Get tab and type from URL params
  const tabFromUrl = searchParams.get('tab') || 'dashboard';
  const typeFromUrl = searchParams.get('type');
  
  const [activeTab, setActiveTab] = React.useState(tabFromUrl);
  const [recurringTransactions, setRecurringTransactions] = React.useState([]);
  const [fromIncomeHistory, setFromIncomeHistory] = React.useState(false);
  
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
    setTransactions,
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
  } = useSupabaseExpenseTracker();

  React.useEffect(() => {
    setActiveTab(tabFromUrl);
    
    // If navigating to transactions with a type filter, apply it
    if (tabFromUrl === 'transactions' && typeFromUrl) {
      setSelectedType(typeFromUrl);
      setFromIncomeHistory(true);
    }
  }, [tabFromUrl, typeFromUrl, setSelectedType]);

  // Update URL when tab changes (but not when filters change to avoid infinite loops)
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // If coming from income history and going to transactions normally, clear filters
    if (newTab === 'transactions' && fromIncomeHistory && !searchParams.get('type')) {
      clearFilters();
      setFromIncomeHistory(false);
    }
    
    // Clear URL params when changing tabs manually
    navigate(`/?tab=${newTab}`, { replace: true });
    
    // Clear filters when switching away from transactions
    if (newTab !== 'transactions') {
      clearFilters();
      setFromIncomeHistory(false);
    }
  };

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

  // New handlers for recurring transactions
  const handleAddRecurring = (recurring: any) => {
    const newRecurring = {
      id: Date.now().toString(),
      ...recurring,
      next_due_date: new Date().toISOString() // Set initial due date to now
    };
    setRecurringTransactions(prev => [...prev, newRecurring]);
  };

  const handleEditRecurring = (id: string, updates: any) => {
    setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleDeleteRecurring = (id: string) => {
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleRecurringActive = (id: string, active: boolean) => {
    setRecurringTransactions(prev => prev.map(r => r.id === id ? { ...r, is_active: active } : r));
  };

  return (
    <AppLayout>
      <div className={`${isMobile ? 'pb-20' : ''}`}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsContent value="dashboard" className={`${isMobile ? 'mt-0' : ''}`}>
            <DashboardTab
              onMessage={handleMessage}
              currentMonthTransactions={currentMonthTransactions}
              recentTransactions={recentTransactions}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              spentToEarnedRatio={spentToEarnedRatio}
              budget={budget}
              accounts={accounts}
              allTransactions={transactions}
            />
          </TabsContent>

          <TabsContent value="transactions" className={`${isMobile ? 'mt-0 pb-20' : ''}`}>
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

          <TabsContent value="budgets" className={`${isMobile ? 'mt-0 pb-20' : ''}`}>
            <EnhancedBudgetTracker
              budgets={budgets}
              categories={categories}
              transactions={transactions}
              onAddBudget={handleAddBudget}
              onUpdateBudget={(id, updates) => setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))}
              onDeleteBudget={(id) => setBudgets(prev => prev.filter(b => b.id !== id))}
            />
          </TabsContent>

          <TabsContent value="categories" className={`${isMobile ? 'mt-0 pb-20' : ''}`}>
            <div className="space-y-6">
              <CategoriesManager
                categories={categories}
                onAddCategory={handleAddCategory}
                onEditCategory={(id, updates) => setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))}
                onDeleteCategory={(id) => setCategories(prev => prev.filter(c => c.id !== id))}
              />
              
              <RecurringTransactionsManager
                recurringTransactions={recurringTransactions}
                categories={categories}
                accounts={accounts}
                onAddRecurring={handleAddRecurring}
                onEditRecurring={handleEditRecurring}
                onDeleteRecurring={handleDeleteRecurring}
                onToggleActive={handleToggleRecurringActive}
              />
            </div>
          </TabsContent>

          <TabsContent value="accounts" className={`${isMobile ? 'mt-0 pb-20' : ''}`}>
            <AccountsManager
              accounts={accounts}
              onAddAccount={handleAddAccount}
              onEditAccount={handleEditAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Index;
