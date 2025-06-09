
import { useMemo } from 'react';
import { Transaction } from '@/types/Transaction';
import { SpendingData } from '@/types/ChartTypes';
import { getCategoryInfo } from '@/utils/categoryUtils';
import { categoryColors } from '@/constants/chartColors';

export const useChartData = (
  data?: SpendingData[],
  transactions?: Transaction[]
): SpendingData[] => {
  return useMemo(() => {
    console.log('useChartData - Processing data');
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
};
