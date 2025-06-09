
import React from 'react';
import { TransactionFilters } from '@/components/TransactionFilters';
import { EnhancedTransactionsList } from '@/components/EnhancedTransactionsList';
import { Transaction, Category, Account } from '@/types/Transaction';

interface TransactionsTabProps {
  filteredTransactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedAccount: string;
  onAccountChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  amountRange: { min: string; max: string };
  onAmountRangeChange: (range: { min: string; max: string }) => void;
  onClearFilters: () => void;
  onEditTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onExportData: () => void;
}

export const TransactionsTab = ({
  filteredTransactions,
  categories,
  accounts,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedAccount,
  onAccountChange,
  selectedType,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  amountRange,
  onAmountRangeChange,
  onClearFilters,
  onEditTransaction,
  onDeleteTransaction,
  onExportData
}: TransactionsTabProps) => {
  return (
    <div className="space-y-6">
      <TransactionFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        selectedAccount={selectedAccount}
        onAccountChange={onAccountChange}
        selectedType={selectedType}
        onTypeChange={onTypeChange}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        amountRange={amountRange}
        onAmountRangeChange={onAmountRangeChange}
        categories={categories}
        accounts={accounts}
        onClearFilters={onClearFilters}
      />
      <EnhancedTransactionsList
        transactions={filteredTransactions}
        categories={categories}
        accounts={accounts}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        onExportData={onExportData}
      />
    </div>
  );
};
