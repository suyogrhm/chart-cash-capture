
import React from 'react';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { CircularSpendingChart } from '@/components/CircularSpendingChart';
import { Transaction, Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { TrendingUp, PieChart, Clock, Plus, Search, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardTabProps {
  onMessage: (message: string, accountId?: string, paymentMethod?: string) => void;
  currentMonthTransactions: Transaction[];
  recentTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  spentToEarnedRatio: number;
  budget: number;
  accounts: Account[];
}

export const DashboardTab = ({
  onMessage,
  currentMonthTransactions,
  recentTransactions,
  totalIncome,
  totalExpenses,
  spentToEarnedRatio,
  budget,
  accounts
}: DashboardTabProps) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();

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
  const safeToSpend = Math.max(0, actualBudget - currentMonthExpenses);
  const remainingDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  const dailySafeToSpend = remainingDays > 0 ? Math.floor(safeToSpend / remainingDays) : 0;

  const handleIncomeClick = () => {
    console.log('Income button clicked - navigating to transactions with income filter');
    // Navigate to transactions tab with income filter applied
    navigate('/?tab=transactions&type=income');
  };

  const handleCategoriesClick = () => {
    console.log('Categories button clicked - navigating to categories management');
    // Navigate to categories tab
    navigate('/?tab=categories');
  };

  // Quick action handlers for quick buttons
  const handleQuickCoffee = () => {
    onMessage('Spent ₹150 on coffee');
  };

  const handleQuickFuel = () => {
    onMessage('Spent ₹2000 on fuel');
  };

  const handleQuickLunch = () => {
    onMessage('Spent ₹300 on lunch');
  };

  const handleQuickMovie = () => {
    onMessage('Spent ₹500 on movie');
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header Section */}
        <div className="bg-card p-6 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-green-500 rounded"></div>
                  <div className="w-1 h-4 bg-yellow-500 rounded"></div>
                  <div className="w-1 h-4 bg-red-500 rounded"></div>
                </div>
              </div>
              <h1 className="text-lg font-medium ml-2 text-foreground">Hi {getUserName()}</h1>
            </div>
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          
          <p className="text-muted-foreground text-sm mb-8">
            Spent in {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </p>
          
          {/* Circular Chart */}
          <div className="mb-8">
            <CircularSpendingChart transactions={currentMonthTransactions} />
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Income</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-foreground font-medium">₹{currentMonthIncome.toLocaleString()}</p>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Budget</p>
              <p className="text-foreground font-medium">₹{actualBudget.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Safe to spend</p>
              <p className="text-foreground font-medium">₹{dailySafeToSpend.toLocaleString()}/day</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button 
              onClick={handleIncomeClick}
              variant="outline" 
              size="sm"
              className="justify-start p-3 h-auto text-xs"
            >
              <DollarSign className="h-3 w-3 mr-2 text-green-500" />
              <span>Income</span>
            </Button>
            <Button 
              onClick={handleCategoriesClick}
              variant="outline" 
              size="sm"
              className="justify-start p-3 h-auto text-xs"
            >
              <PieChart className="h-3 w-3 mr-2 text-purple-500" />
              <span>Categories</span>
            </Button>
          </div>

          {/* Quick Transaction Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <Button onClick={handleQuickCoffee} variant="outline" size="sm" className="text-xs">
              ☕ Coffee ₹150
            </Button>
            <Button onClick={handleQuickFuel} variant="outline" size="sm" className="text-xs">
              🚗 Fuel ₹2000
            </Button>
            <Button onClick={handleQuickLunch} variant="outline" size="sm" className="text-xs">
              🍔 Lunch ₹300
            </Button>
            <Button onClick={handleQuickMovie} variant="outline" size="sm" className="text-xs">
              🎬 Movie ₹500
            </Button>
          </div>
        </div>

        {/* Quick Add Input */}
        <div className="px-6 py-4">
          <MessageInput onMessage={onMessage} accounts={accounts} />
        </div>

        {/* Recent Transactions */}
        <div className="bg-card rounded-t-3xl min-h-[300px] flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground text-lg">Recent transactions</h3>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <TransactionsList transactions={recentTransactions.slice(0, 5)} />
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

                {/* Safe to Spend Card */}
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl border border-purple-200/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Safe to Spend</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">₹{dailySafeToSpend.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">per day remaining</p>
                </div>
              </div>

              {/* Quick Transaction Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleQuickCoffee} variant="outline" size="sm" className="text-xs hover:bg-primary/10">
                  ☕ Coffee ₹150
                </Button>
                <Button onClick={handleQuickFuel} variant="outline" size="sm" className="text-xs hover:bg-primary/10">
                  🚗 Fuel ₹2000
                </Button>
                <Button onClick={handleQuickLunch} variant="outline" size="sm" className="text-xs hover:bg-primary/10">
                  🍔 Lunch ₹300
                </Button>
                <Button onClick={handleQuickMovie} variant="outline" size="sm" className="text-xs hover:bg-primary/10">
                  🎬 Movie ₹500
                </Button>
              </div>
            </div>

            {/* Chart */}
            <div className="lg:col-span-3">
              <CircularSpendingChart transactions={currentMonthTransactions} />
            </div>
          </div>
        </div>
      </Card>

      <MessageInput onMessage={onMessage} accounts={accounts} />

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

      <TransactionsList transactions={recentTransactions} />
    </div>
  );
};
