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
  console.log('Sample transaction:', transactions[0]);

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
    'food': { name: 'Food & Dining', color: '#EF4444', icon: '🍽️' },
    'transport': { name: 'Transportation', color: '#3B82F6', icon: '🚗' },
    'transportation': { name: 'Transportation', color: '#3B82F6', icon: '🚗' },
    'entertainment': { name: 'Entertainment', color: '#8B5CF6', icon: '🎮' },
    'bills': { name: 'Bills & Utilities', color: '#F59E0B', icon: '⚡' },
    'utilities': { name: 'Bills & Utilities', color: '#F59E0B', icon: '⚡' },
    'shopping': { name: 'Shopping', color: '#EC4899', icon: '🛒' },
    'fuel': { name: 'Fuel', color: '#10B981', icon: '⛽' },
    'salary': { name: 'Salary', color: '#06B6D4', icon: '💰' },
    'freelance': { name: 'Freelance', color: '#84CC16', icon: '💼' },
    'other': { name: 'Other', color: '#6B7280', icon: '📦' },
  };

  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category?.toLowerCase() || 'other';
      console.log('Processing transaction category:', category, 'amount:', transaction.amount);
      
      // Try to find category in mapping
      let categoryInfo = categoryMapping[category as keyof typeof categoryMapping];
      
      // If not found, try to find a partial match
      if (!categoryInfo) {
        const matchingKey = Object.keys(categoryMapping).find(key => 
          key.toLowerCase().includes(category) || category.includes(key.toLowerCase())
        );
        if (matchingKey) {
          categoryInfo = categoryMapping[matchingKey as keyof typeof categoryMapping];
        }
      }
      
      // If still not found, use 'other'
      if (!categoryInfo) {
        categoryInfo = categoryMapping.other;
      }
      
      const key = categoryInfo.name;
      acc[key] = (acc[key] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  console.log('Expenses by category:', expensesByCategory);

  // Convert to chart data format with different colors
  const chartData = Object.entries(expensesByCategory).map(([categoryName, amount]) => {
    const categoryEntry = Object.values(categoryMapping).find(cat => cat.name === categoryName);
    return {
      category: categoryName,
      amount,
      fill: categoryEntry?.color || '#6B7280',
      icon: categoryEntry?.icon || '📦'
    };
  });

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);
  const maxBudget = 50000;
  const progressPercentage = Math.min((totalExpenses / maxBudget) * 100, 100);

  // Calculate segments for the pie chart
  let cumulativePercentage = 0;
  const segments = chartData.map((item) => {
    const percentage = (item.amount / totalExpenses) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    cumulativePercentage += percentage;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      path: createArcPath(50, 50, 35, startAngle, endAngle)
    };
  });

  function createArcPath(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  }

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  console.log('Chart data:', chartData);
  console.log('Total expenses:', totalExpenses);

  if (isMobile) {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-6">
          {chartData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-48 h-48 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-full p-4 shadow-2xl">
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
                  const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
                  return (
                    <div key={item.category} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.fill }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground truncate">{item.icon} {item.category}</p>
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
    <Card className="bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-3 text-foreground">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          Expenses Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Enhanced Pie Chart */}
            <div className="relative flex justify-center">
              <div className="relative">
                <svg width="280" height="280" viewBox="0 0 100 100" className="drop-shadow-2xl">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="hsl(var(--muted))"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                  />
                  
                  {/* Pie segments */}
                  {segments.map((segment, index) => (
                    <path
                      key={segment.category}
                      d={segment.path}
                      fill={segment.fill}
                      stroke="white"
                      strokeWidth="0.3"
                      className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                      style={{
                        filter: `drop-shadow(0 2px 4px ${segment.fill}30)`
                      }}
                    />
                  ))}
                  
                  {/* Center circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="18"
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-primary mb-2">
                    <TrendingUp className="h-8 w-8" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Total Spent</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Legend */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Categories</h3>
              {chartData.map((item) => {
                const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
                return (
                  <div key={item.category} className="group">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50 hover:border-border transition-all duration-200 hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div 
                            className="w-5 h-5 rounded-full shadow-lg border border-white/20" 
                            style={{ backgroundColor: item.fill }}
                          />
                          <div className="absolute -top-1 -right-1 text-xs">
                            {item.icon}
                          </div>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground text-base">{item.category}</span>
                          <p className="text-sm text-muted-foreground">{percentage}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-lg">₹{item.amount.toLocaleString()}</p>
                        <div 
                          className="h-2 rounded-full mt-1 transition-all duration-300"
                          style={{ 
                            backgroundColor: item.fill,
                            width: `${Math.max(percentage * 2, 20)}px`,
                            opacity: 0.3
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No expense data available</h3>
            <p className="text-sm">Add some expenses to see the breakdown</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
