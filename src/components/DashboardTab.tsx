import React, { useState } from 'react';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { CircularSpendingChart } from '@/components/CircularSpendingChart';
import { TransactionFrequencyCard } from '@/components/TransactionFrequencyCard';
import { Transaction, Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { TrendingUp, PieChart, Search, DollarSign, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ExpenseTrackerLogo } from '@/components/ExpenseTrackerLogo';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getCategoryInfo } from '@/utils/categoryUtils';
import { Badge } from '@/components/ui/badge';

interface DashboardTabProps {
  onMessage: (message: string, accountId?: string, paymentMethod?: string) => void;
  currentMonthTransactions: Transaction[];
  recentTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  spentToEarnedRatio: number;
  budget: number;
  accounts: Account[];
  allTransactions: Transaction[];
}

export const DashboardTab = ({
  onMessage,
  currentMonthTransactions,
  recentTransactions,
  totalIncome,
  totalExpenses,
  spentToEarnedRatio,
  budget,
  accounts,
  allTransactions
}: DashboardTabProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFrequencySheetOpen, setIsFrequencySheetOpen] = useState(false);

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Calculate correct metrics
  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const actualBudget = budget || 50000; // Default budget if not set
  const actualSpentToEarnedRatio = currentMonthIncome > 0 ? (currentMonthExpenses / currentMonthIncome) * 100 : 0;

  const handleIncomeClick = () => {
    console.log('Income button clicked - navigating to transactions with income filter');
    navigate('/?tab=transactions&type=income');
  };

  const handleCategoriesClick = () => {
    console.log('Categories button clicked - navigating to categories management');
    navigate('/?tab=categories');
  };

  // Enhanced mobile transaction card component
  const EnhancedMobileTransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const categoryInfo = getCategoryInfo(transaction.category);
    const getAccountName = (accountId?: string) => {
      if (!accountId) return 'Default';
      const account = accounts.find(a => a.id === accountId);
      return account ? account.name : 'Unknown';
    };

    const getAccountColor = (accountId?: string) => {
      if (!accountId) return '#6B7280';
      const account = accounts.find(a => a.id === accountId);
      return account ? account.color : '#6B7280';
    };

    return (
      <div className="bg-card rounded-xl border border-border/30 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-border/20`}
                 style={{ 
                   backgroundColor: transaction.type === 'income' 
                     ? 'hsl(var(--success)/0.1)' 
                     : `${categoryInfo.color}15`
                 }}>
              <span className="text-lg" style={{ 
                filter: 'contrast(1.2) brightness(0.9)',
                color: transaction.type === 'income' ? 'hsl(var(--success))' : categoryInfo.color
              }}>
                {categoryInfo.icon}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs px-2 py-0.5 h-5 bg-muted/50 text-muted-foreground border-border/50">
                  {categoryInfo.name}
                </Badge>
              </div>
              <p className="font-semibold text-card-foreground text-base leading-tight mb-2">
                {transaction.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getAccountColor(transaction.account_id) }}
                  />
                  <span>{getAccountName(transaction.account_id)}</span>
                </div>
                <span>•</span>
                <span>{new Date(transaction.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0 ml-3">
            <p className={`font-bold text-lg ${
              transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-card-foreground'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
            </p>
            {transaction.type === 'income' && (
              <div className="text-green-600 dark:text-green-400 text-xs flex justify-end mt-1">Income</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Optimized Mobile Header */}
        <div className="bg-card p-4 border-b border-border">
          {/* Simplified Header - Only show user greeting */}
          <div className="mb-4">
            <p className="text-xl font-semibold text-foreground">Hi {getUserName()}</p>
          </div>
          
          {/* Circular Chart */}
          <div className="mb-6">
            <CircularSpendingChart transactions={currentMonthTransactions} />
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Income</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-foreground font-medium text-sm">₹{currentMonthIncome.toLocaleString()}</p>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Budget</p>
              <p className="text-foreground font-medium text-sm">₹{actualBudget.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Spent/Earned</p>
              <p className={`text-foreground font-medium text-sm ${
                actualSpentToEarnedRatio > 100 ? 'text-red-500' : 
                actualSpentToEarnedRatio > 80 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {actualSpentToEarnedRatio.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Quick Actions - Fixed spacing and text overflow */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button 
              onClick={handleIncomeClick}
              variant="outline" 
              size="sm"
              className="justify-center p-2 h-auto text-[10px] flex-col gap-1"
            >
              <DollarSign className="h-3 w-3 text-green-500" />
              <span className="truncate w-full">Income</span>
            </Button>
            <Button 
              onClick={handleCategoriesClick}
              variant="outline" 
              size="sm"
              className="justify-center p-2 h-auto text-[10px] flex-col gap-1"
            >
              <PieChart className="h-3 w-3 text-purple-500" />
              <span className="truncate w-full">Categories</span>
            </Button>
            <Sheet open={isFrequencySheetOpen} onOpenChange={setIsFrequencySheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="justify-center p-2 h-auto text-[10px] flex-col gap-1"
                >
                  <BarChart3 className="h-3 w-3 text-orange-500" />
                  <span className="truncate w-full">Frequent</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]">
                <SheetHeader>
                  <SheetTitle className="text-base">Frequent Expenses</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <TransactionFrequencyCard transactions={allTransactions} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Quick Add Input - Better Spacing */}
        <div className="px-4 py-6">
          <MessageInput onMessage={onMessage} accounts={accounts} />
        </div>

        {/* Enhanced Recent Transactions Section */}
        <div className="bg-card rounded-t-3xl min-h-[400px] flex-1">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground text-lg">Recent transactions</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary"
                onClick={() => navigate('/?tab=transactions')}
              >
                View all
              </Button>
            </div>
            <div className="space-y-3">
              {recentTransactions.slice(0, 4).map((transaction) => (
                <EnhancedMobileTransactionCard key={transaction.id} transaction={transaction} />
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No recent transactions</p>
                  <p className="text-xs mt-1">Add your first transaction above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="space-y-8 bg-background min-h-screen">
      {/* Header */}
      <Card className="bg-gradient-to-r from-card/80 to-card border border-border/50 shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Hello {getUserName()}! 👋</h1>
              <p className="text-muted-foreground text-lg">Here's your spending overview for {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Search className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Enhanced Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid gap-4">
                {/* Income Card */}
                <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl border border-green-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Monthly Income</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">₹{currentMonthIncome.toLocaleString()}</p>
                  <p className="text-xs text-green-600 mt-1">+100% this month</p>
                </div>

                {/* Budget Card */}
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl border border-blue-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Budget</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">₹{actualBudget.toLocaleString()}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Used: {actualBudget > 0 ? ((currentMonthExpenses / actualBudget) * 100).toFixed(1) : 0}%</span>
                      <span>₹{currentMonthExpenses.toLocaleString()} spent</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${Math.min((currentMonthExpenses / actualBudget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Spent to Earned Ratio Card */}
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Spent/Earned Ratio</span>
                  </div>
                  <p className={`text-2xl font-bold ${
                    actualSpentToEarnedRatio > 100 ? 'text-red-500' : 
                    actualSpentToEarnedRatio > 80 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {actualSpentToEarnedRatio.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {actualSpentToEarnedRatio > 100 ? 'Spending exceeds income' :
                     actualSpentToEarnedRatio > 80 ? 'High spending ratio' : 'Healthy spending ratio'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="lg:col-span-3">
              <CircularSpendingChart transactions={currentMonthTransactions} />
            </div>
          </div>
        </div>
      </Card>

      {/* Frequent Expenses Card positioned right below the spending chart */}
      <TransactionFrequencyCard transactions={allTransactions} />

      <MessageInput onMessage={onMessage} accounts={accounts} />

      {/* Call-to-action buttons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="p-4 h-auto text-left bg-card hover:bg-accent/50 border-border/50 transition-all duration-200"
          onClick={handleIncomeClick}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Income History</h3>
              <p className="text-xs text-muted-foreground">View all your income transactions</p>
            </div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="p-4 h-auto text-left bg-card hover:bg-accent/50 border-border/50 transition-all duration-200"
          onClick={handleCategoriesClick}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <PieChart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Categories</h3>
              <p className="text-xs text-muted-foreground">Manage spending categories</p>
            </div>
          </div>
        </Button>
      </div>

      {/* Recent Transactions positioned below the call-to-action buttons */}
      <TransactionsList transactions={recentTransactions} />
    </div>
  );
};
