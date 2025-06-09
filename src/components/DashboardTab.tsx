
import React from 'react';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { CircularSpendingChart } from '@/components/CircularSpendingChart';
import { Transaction, Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { TrendingUp, PieChart, Clock, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const handleTrendsClick = () => {
    console.log('Trends functionality - showing spending trends and analytics');
    // This would typically navigate to a trends page or show a modal with trends
  };

  const handleCategoriesClick = () => {
    console.log('Categories functionality - showing category management');
    // This would typically navigate to categories tab or show category management
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
                <p className="text-foreground font-medium">₹{totalIncome.toLocaleString()}</p>
                <div className="w-2 h-2 bg-muted rounded-full"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Budget</p>
              <p className="text-foreground font-medium">₹{budget.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Safe to spend</p>
              <p className="text-foreground font-medium">₹{Math.max(0, budget - totalExpenses).toLocaleString()}/day</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button 
              onClick={handleTrendsClick}
              variant="outline" 
              className="justify-start p-4 h-auto"
            >
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm">Trends</span>
            </Button>
            <Button 
              onClick={handleCategoriesClick}
              variant="outline" 
              className="justify-start p-4 h-auto"
            >
              <PieChart className="h-4 w-4 mr-2 text-purple-500" />
              <span className="text-sm">Categories</span>
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
      <Card className="bg-gradient-to-r from-card to-card/80 border-border">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hi {getUserName()}</h1>
              <p className="text-muted-foreground">Spent in {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
            </div>
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <CircularSpendingChart transactions={currentMonthTransactions} />
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Income</p>
                  <p className="text-foreground text-xl font-semibold">₹{totalIncome.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Budget</p>
                  <p className="text-foreground text-xl font-semibold">₹{budget.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">Safe to spend</p>
                  <p className="text-foreground text-xl font-semibold">₹{Math.max(0, budget - totalExpenses).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <MessageInput onMessage={onMessage} accounts={accounts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-lg transition-all duration-200"
          onClick={handleTrendsClick}
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Trends</h3>
              <p className="text-sm opacity-90">View spending insights</p>
            </div>
          </div>
        </Card>
        <Card 
          className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 cursor-pointer hover:shadow-lg transition-all duration-200"
          onClick={handleCategoriesClick}
        >
          <div className="flex items-center gap-3">
            <PieChart className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Categories</h3>
              <p className="text-sm opacity-90">Manage spending categories</p>
            </div>
          </div>
        </Card>
      </div>

      <TransactionsList transactions={recentTransactions} />
    </div>
  );
};
