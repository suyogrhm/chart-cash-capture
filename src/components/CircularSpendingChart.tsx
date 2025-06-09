
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/Transaction';

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

const categoryColors: Record<string, string> = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4',
  'Shopping': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Bills & Utilities': '#FECA57',
  'Healthcare': '#FF9FF3',
  'Education': '#54A0FF',
  'Travel': '#5F27CD',
  'Personal Care': '#00D2D3',
  'Groceries': '#FF9F43',
  'Fuel': '#FF6348',
  'Salary': '#2ECC71',
  'Freelance': '#3498DB',
  'Other': '#95A5A6'
};

// Map category IDs to names (matching the getCategoryInfo function in TransactionsList)
const getCategoryName = (categoryId: string) => {
  const categories: { [key: string]: string } = {
    '1': 'Food & Dining',
    '2': 'Transportation',
    '3': 'Entertainment',
    '4': 'Bills & Utilities',
    '5': 'Shopping',
    '6': 'Fuel',
    '7': 'Salary',
    '8': 'Freelance',
  };
  return categories[categoryId] || 'Other';
};

export const CircularSpendingChart = ({ 
  data, 
  transactions, 
  title = "Spending by Category" 
}: CircularSpendingChartProps) => {
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
      const categoryName = getCategoryName(transaction.category);
      console.log('Processing transaction:', {
        id: transaction.id,
        categoryId: transaction.category,
        categoryName,
        amount: transaction.amount
      });
      
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += Number(transaction.amount) || 0;
      return acc;
    }, {} as Record<string, number>);

    console.log('Category totals calculated:', categoryTotals);

    // Convert to chart data format
    const result = Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0) // Only include categories with spending
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        color: categoryColors[category] || categoryColors['Other']
      }))
      .sort((a, b) => b.value - a.value); // Sort by amount descending

    console.log('Final chart data:', result);
    return result;
  }, [data, transactions]);

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
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
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
      </CardContent>
    </Card>
  );
};
