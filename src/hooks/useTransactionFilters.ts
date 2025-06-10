
import { useState, useEffect } from 'react';
import { Transaction } from '@/types/Transaction';
import { getCategoryInfo } from '@/utils/categoryUtils';

export const useTransactionFilters = (transactions: Transaction[]) => {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t => {
        // Search in description and original message (existing logic)
        const descriptionMatch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
        const messageMatch = t.original_message?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        
        // Search in category name (new logic)
        const categoryInfo = getCategoryInfo(t.category);
        const categoryMatch = categoryInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        return descriptionMatch || messageMatch || categoryMatch;
      });
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.account_id === selectedAccount);
    }

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dateRange.from! && transactionDate <= dateRange.to!;
      });
    }

    if (amountRange.min || amountRange.max) {
      filtered = filtered.filter(t => {
        const min = parseFloat(amountRange.min) || 0;
        const max = parseFloat(amountRange.max) || Infinity;
        return t.amount >= min && t.amount <= max;
      });
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedCategory, selectedAccount, selectedType, dateRange, amountRange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setSelectedType('all');
    setDateRange({});
    setAmountRange({ min: '', max: '' });
  };

  return {
    filteredTransactions,
    searchTerm,
    selectedCategory,
    selectedAccount,
    selectedType,
    dateRange,
    amountRange,
    setSearchTerm,
    setSelectedCategory,
    setSelectedAccount,
    setSelectedType,
    setDateRange,
    setAmountRange,
    clearFilters,
  };
};
