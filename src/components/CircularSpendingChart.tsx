import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/Transaction';
import { getCategoryInfo } from '@/utils/categoryUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SpendingData {
  name: string;
  value: number;
  color: string;
}

interface CircularSpendingChartProps {
  data?: SpendingData[];
  transactions?: Transaction[];
  title?: string;
}

// Define a color palette for different categories
const categoryColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
];

export const CircularSpendingChart = ({ 
  data, 
  transactions, 
  title = "Spending by Category" 
}: CircularSpendingChartProps) => {
  const isMobile = useIsMobile();

  const chartData = useMemo(() => {
    console.log('CircularSpendingChart - Processing data');
    console.log('Provided data:', data);
    console.log('Provided transactions:', transactions);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log('Using provided data array');
      return data;
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      console.log('No valid transactions provided');
      return [];
    }

    console.log('Processing transactions for chart data');
    
    // Filter for expense transactions only
    const expenseTransactions = transactions.filter(t => {
      console.log('Transaction type check:', t.type, t);
      return t.type === 'expense';
    });

    console.log('Filtered expense transactions:', expenseTransactions);

    if (expenseTransactions.length === 0) {
      console.log('No expense transactions found');
      return [];
    }

    // Group transactions by category and calculate totals
    const categoryTotals = expenseTransactions.reduce((acc, transaction) => {
      const categoryInfo = getCategoryInfo(transaction.category);
      console.log('Processing transaction:', {
        id: transaction.id,
        categoryId: transaction.category,
        categoryName: categoryInfo.name,
        amount: transaction.amount
      });
      
      if (!acc[categoryInfo.name]) {
        acc[categoryInfo.name] = 0;
      }
      acc[categoryInfo.name] += Number(transaction.amount) || 0;
      return acc;
    }, {} as Record<string, number>);

    console.log('Category totals calculated:', categoryTotals);

    // Convert to chart data format with assigned colors
    const result = Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0) // Only include categories with spending
      .map(([category, amount], index) => {
        return {
          name: category,
          value: amount,
          color: categoryColors[index % categoryColors.length]
        };
      })
      .sort((a, b) => b.value - a.value); // Sort by amount descending

    console.log('Final chart data:', result);
    return result;
  }, [data, transactions]);

  // Calculate total spending for center display
  const totalSpending = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  // Get current month name
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  // Dynamic sizing based on screen size with adjusted thickness
  const chartConfig = useMemo(() => {
    if (isMobile) {
      return {
        outerRadius: 80,
        innerRadius: 60, // Reduced thickness
        height: 250
      };
    } else {
      return {
        outerRadius: 100,
        innerRadius: 80, // Reduced thickness
        height: 300
      };
    }
  }, [isMobile]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-card border-chart-border">
        <CardHeader>
          <CardTitle className="text-chart-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No spending data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{data.name}</p>
          <p className="text-primary">
            Amount: ₹{Number(data.value).toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card border-chart-border">
      <CardHeader>
        <CardTitle className="text-chart-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full flex items-center justify-center" style={{ height: `${chartConfig.height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={chartConfig.outerRadius}
                innerRadius={chartConfig.innerRadius}
                strokeWidth={2}
                stroke="hsl(var(--border))"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered text using flexbox for perfect alignment */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-foreground leading-tight`}>
                ₹{totalSpending.toLocaleString()}
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                Spent in {currentMonth}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
