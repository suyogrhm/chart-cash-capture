
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
  'Other': '#C7ECEE'
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
    if (data) {
      return data;
    }

    if (transactions && Array.isArray(transactions)) {
      // Group transactions by category and calculate totals
      const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
          const categoryName = getCategoryName(transaction.category);
          acc[categoryName] = (acc[categoryName] || 0) + transaction.amount;
          return acc;
        }, {} as Record<string, number>);

      // Convert to chart data format
      return Object.entries(categoryTotals).map(([category, amount]) => ({
        name: category,
        value: amount,
        color: categoryColors[category] || categoryColors['Other']
      }));
    }

    return [];
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
              innerRadius={75}
              strokeWidth={0.5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--chart-bg))',
                border: '1px solid hsl(var(--chart-border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
