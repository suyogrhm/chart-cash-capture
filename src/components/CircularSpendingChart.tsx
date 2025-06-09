
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/Transaction';
import { TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CircularSpendingChartProps {
  transactions: Transaction[];
}

export const CircularSpendingChart = ({ transactions }: CircularSpendingChartProps) => {
  const isMobile = useIsMobile();

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

  const chartConfig = {
    amount: {
      label: "Amount",
    },
  };

  if (isMobile) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 text-white">
        {chartData.length > 0 ? (
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-48 h-48 relative">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                
                {/* Progress ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(totalExpenses / 50000) * 283} 283`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-blue-400 mb-1">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">49%</p>
                </div>
              </div>
            </div>
            
            {/* Compact legend for mobile */}
            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              {chartData.slice(0, 4).map((item) => {
                const categoryInfo = Object.values(categoryMapping).find(cat => cat.name === item.category);
                return (
                  <div key={item.category} className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-slate-300 truncate">{categoryInfo?.icon} {item.category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No expense data</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Expenses by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Chart */}
            <div className="relative flex justify-center">
              <div className="w-64 h-64 relative">
                {/* Background circle */}
                <div className="absolute inset-0 rounded-full border-8 border-slate-700"></div>
                
                {/* Progress ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="12"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(totalExpenses / 50000) * 264} 264`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-blue-400 mb-2">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold text-white">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">49%</p>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              {chartData.map((item) => {
                const categoryInfo = Object.values(categoryMapping).find(cat => cat.name === item.category);
                const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
                return (
                  <div key={item.category} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryInfo?.icon}</span>
                        <span className="font-medium text-white">{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">₹{item.amount.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No expense data available</p>
            <p className="text-sm">Add some expenses to see the breakdown</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
