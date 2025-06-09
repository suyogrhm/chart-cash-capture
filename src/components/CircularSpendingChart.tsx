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

// More vibrant colors for different categories
const categoryColors: Record<string, string> = {
  'Food & Dining': '#FF4081',     // Vibrant pink
  'Transportation': '#00BCD4',    // Cyan
  'Shopping': '#9C27B0',          // Purple
  'Entertainment': '#FF5722',     // Deep orange
  'Bills & Utilities': '#FFC107', // Amber
  'Healthcare': '#E91E63',        // Pink
  'Education': '#3F51B5',         // Indigo
  'Travel': '#795548',            // Brown
  'Personal Care': '#607D8B',     // Blue grey
  'Groceries': '#8BC34A',         // Light green
  'Fuel': '#FF9800',              // Orange
  'Salary': '#4CAF50',            // Green
  'Freelance': '#2196F3',         // Blue
  'Rental Income': '#009688',     // Teal
  'Other': '#9E9E9E'              // Grey
};

// Improved category name mapping that handles actual data
const getCategoryName = (categoryId: string) => {
  // Handle numbered categories (legacy support)
  const numberedCategories: { [key: string]: string } = {
    '1': 'Food & Dining',
    '2': 'Transportation',
    '3': 'Entertainment',
    '4': 'Bills & Utilities',
    '5': 'Shopping',
    '6': 'Fuel',
    '7': 'Salary',
    '8': 'Freelance',
  };

  // If it's a numbered category, use the mapping
  if (numberedCategories[categoryId]) {
    return numberedCategories[categoryId];
  }

  // Handle string category names directly
  const stringCategoryMapping: { [key: string]: string } = {
    'food': 'Food & Dining',
    'entertainment': 'Entertainment',
    'fuel': 'Fuel',
    'rental income': 'Rental Income',
    'transportation': 'Transportation',
    'shopping': 'Shopping',
    'bills': 'Bills & Utilities',
    'healthcare': 'Healthcare',
    'education': 'Education',
    'travel': 'Travel',
    'personal care': 'Personal Care',
    'groceries': 'Groceries',
    'salary': 'Salary',
    'freelance': 'Freelance',
  };

  // Check if it's a known string category
  const lowerCaseCategory = categoryId.toLowerCase();
  if (stringCategoryMapping[lowerCaseCategory]) {
    return stringCategoryMapping[lowerCaseCategory];
  }

  // If it's a UUID or unknown category, return a cleaned up version or "Other"
  if (categoryId.length > 20) {
    // Likely a UUID, return "Other"
    return 'Other';
  }

  // Capitalize first letter for unknown but short category names
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
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
