
import React from 'react';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { MetricsCards } from '@/components/MetricsCards';
import { CircularSpendingChart } from '@/components/CircularSpendingChart';
import { Transaction, Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white pb-20">
        {/* Header Section with Dark Theme */}
        <div className="bg-slate-950 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-green-500 rounded"></div>
                  <div className="w-1 h-4 bg-yellow-500 rounded"></div>
                  <div className="w-1 h-4 bg-red-500 rounded"></div>
                </div>
              </div>
              <h1 className="text-lg font-medium ml-2">Hi User</h1>
            </div>
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          
          <p className="text-slate-400 text-sm mb-8">
            Spent in {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </p>
          
          {/* Circular Chart with Dark Theme */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <CircularSpendingChart transactions={currentMonthTransactions} />
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-slate-400 text-xs mb-1">Income</p>
              <div className="flex items-center justify-center gap-1">
                <p className="text-white font-medium">₹{totalIncome.toLocaleString()}</p>
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs mb-1">Budget</p>
              <p className="text-white font-medium">₹{budget.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs mb-1">Safe to spend</p>
              <p className="text-white font-medium">₹{Math.max(0, budget - totalExpenses).toLocaleString()}/day</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white justify-start p-4 h-auto">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-400" />
              <span className="text-sm">Trends</span>
            </Button>
            <Button className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-white justify-start p-4 h-auto">
              <PieChart className="h-4 w-4 mr-2 text-purple-400" />
              <span className="text-sm">Categories</span>
            </Button>
          </div>
        </div>

        {/* Quick Add Input */}
        <div className="px-6 mb-6">
          <MessageInput onMessage={onMessage} accounts={accounts} />
        </div>

        {/* Recent Transactions with Modern Design */}
        <div className="bg-white rounded-t-3xl min-h-[300px] flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900 text-lg">Recent transactions</h3>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className="text-xl">
                        {transaction.category === '1' ? '🍽️' : 
                         transaction.category === '2' ? '🚗' :
                         transaction.category === '3' ? '🎮' :
                         transaction.category === '7' ? '💰' : '💳'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{transaction.description}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-slate-900'
                    }`}>
                      ₹{transaction.amount.toLocaleString()}
                    </p>
                    {transaction.type === 'income' && (
                      <div className="text-green-600 text-xs">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop version with updated styling
  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Hi User</h1>
            <p className="text-slate-300">Spent in {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
          </div>
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <CircularSpendingChart transactions={currentMonthTransactions} />
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Income</p>
                <p className="text-white text-xl font-semibold">₹{totalIncome.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Budget</p>
                <p className="text-white text-xl font-semibold">₹{budget.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-400 text-sm mb-2">Safe to spend</p>
                <p className="text-white text-xl font-semibold">₹{Math.max(0, budget - totalExpenses).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MessageInput onMessage={onMessage} accounts={accounts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Trends</h3>
              <p className="text-sm opacity-90">View spending insights</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
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
