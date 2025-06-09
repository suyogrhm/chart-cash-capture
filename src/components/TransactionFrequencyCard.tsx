
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/Transaction';
import { Badge } from '@/components/ui/badge';

interface TransactionFrequencyCardProps {
  transactions: Transaction[];
}

interface FrequencyData {
  category: string;
  count: number;
  totalAmount: number;
  icon: string;
}

export const TransactionFrequencyCard = ({ transactions }: TransactionFrequencyCardProps) => {
  // Calculate frequency for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear &&
           t.type === 'expense';
  });

  // Group by category and count occurrences
  const frequencyMap = currentMonthTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = {
        category,
        count: 0,
        totalAmount: 0,
        icon: getCategoryIcon(category)
      };
    }
    acc[category].count += 1;
    acc[category].totalAmount += transaction.amount;
    return acc;
  }, {} as Record<string, FrequencyData>);

  // Convert to array and sort by count (descending)
  const frequencyData = Object.values(frequencyMap)
    .filter(item => item.count > 1) // Only show categories with more than 1 transaction
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Show top 6

  const getCategoryIcon = (category: string): string => {
    const iconMap: Record<string, string> = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Entertainment': '🎮',
      'Bills & Utilities': '⚡',
      'Shopping': '🛒',
      'Fuel': '⛽',
      'Groceries': '🛍️',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️'
    };
    return iconMap[category] || '💰';
  };

  if (frequencyData.length === 0) {
    return (
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">Frequent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recurring patterns found this month</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">Frequent Expenses This Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {frequencyData.map((item, index) => (
          <div key={item.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icon}</span>
              <div>
                <p className="font-medium text-foreground">{item.category}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{item.totalAmount.toLocaleString()} total
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {item.count} times
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
