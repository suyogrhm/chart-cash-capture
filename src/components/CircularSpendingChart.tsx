
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/Transaction';
import { TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CircularSpendingChartProps {
  transactions: Transaction[];
}

export const CircularSpendingChart = ({ transactions }: CircularSpendingChartProps) => {
  const isMobile = useIsMobile();

  console.log('CircularSpendingChart rendered with transactions:', transactions.length);

  // Category mappings with proper names and colors
  const categoryMapping = {
    '1': { name: 'Food & Dining', color: '#EF4444', icon: '🍽️' },
    '2': { name: 'Transportation', color: '#3B82F6', icon: '🚗' },
    '3': { name: 'Entertainment', color: '#8B5CF6', icon: '🎮' },
    '4': { name: 'Bills & Utilities', color: '#F59E0B', icon: '⚡' },
    '5': { name: 'Shopping', color: '#EC4899', icon: '🛒' },
    '6': { name: 'Fuel', color: '#10B981', icon: '⛽' },
    '7': { name: 'Salary', color: '#06B6D4', icon: '💰' },
    '8': { name: 'Freelance', color: '#84CC16', icon: '💼' },
  };

  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      const categoryInfo = categoryMapping[category as keyof typeof categoryMapping];
      if (categoryInfo) {
        const key = categoryInfo.name;
        acc[key] = (acc[key] || 0) + transaction.amount;
      }
      return acc;
    }, {} as Record<string, number>);

  // Convert to chart data format
  const chartData = Object.entries(expensesByCategory).map(([categoryName, amount]) => {
    const categoryEntry = Object.values(categoryMapping).find(cat => cat.name === categoryName);
    return {
      category: categoryName,
      amount,
      fill: categoryEntry?.color || '#6B7280'
    };
  });

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);
  const maxBudget = 50000;
  const progressPercentage = Math.min((totalExpenses / maxBudget) * 100, 100);

  console.log('Chart data:', chartData);
  console.log('Total expenses:', totalExpenses);

  if (isMobile) {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-6">
          {chartData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-full p-4">
                  {/* Progress ring */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${(progressPercentage / 100) * 264} 264`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-blue-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold">
                      ₹{totalExpenses.toLocaleString()}
                    </p>
                    <p className="text-xs opacity-70 mt-1">{progressPercentage.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
              
              {/* Compact legend for mobile */}
              <div className="grid grid-cols-2 gap-3 w-full text-sm">
                {chartData.slice(0, 4).map((item) => {
                  const categoryInfo = Object.values(categoryMapping).find(cat => cat.name === item.category);
                  const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
                  return (
                    <div key={item.category} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground truncate">{categoryInfo?.icon} {item.category}</p>
                        <p className="text-sm font-medium text-foreground">₹{item.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-white/20" />
              </div>
              <p>No expense data</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          Expenses by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Chart */}
            <div className="relative flex justify-center">
              <div className="w-64 h-64 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-full p-6">
                {/* Progress ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(progressPercentage / 100) * 264} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="text-blue-400 mb-2">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-70 mt-1">{progressPercentage.toFixed(0)}%</p>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              {chartData.map((item) => {
                const categoryInfo = Object.values(categoryMapping).find(cat => cat.name === item.category);
                const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
                return (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryInfo?.icon}</span>
                        <span className="font-medium text-foreground">{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">₹{item.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-white/20" />
            </div>
            <p>No expense data available</p>
            <p className="text-sm">Add some expenses to see the breakdown</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
