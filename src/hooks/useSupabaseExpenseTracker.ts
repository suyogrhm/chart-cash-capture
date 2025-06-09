
import { useSupabaseData } from './useSupabaseData';
import { useTransactionOperations } from './useTransactionOperations';
import { useAccountOperations } from './useAccountOperations';
import { useCategoryOperations } from './useCategoryOperations';
import { useBudgetOperations } from './useBudgetOperations';
import { useTransactionFilters } from './useTransactionFilters';

export const useSupabaseExpenseTracker = () => {
  const {
    transactions,
    categories,
    accounts,
    budgets,
    setTransactions,
    setCategories,
    setAccounts,
    setBudgets,
  } = useSupabaseData();

  const {
    handleMessage,
    handleEditTransaction,
    handleDeleteTransaction,
    handleExportData,
  } = useTransactionOperations(transactions, setTransactions, accounts);

  const {
    handleAddAccount,
    handleEditAccount,
    handleDeleteAccount,
  } = useAccountOperations(accounts, setAccounts);

  const {
    handleAddCategory,
  } = useCategoryOperations(categories, setCategories);

  const {
    handleAddBudget,
  } = useBudgetOperations(budgets, setBudgets);

  const {
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
  } = useTransactionFilters(transactions);

  return {
    transactions,
    categories,
    accounts,
    budgets,
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
    setCategories,
    setAccounts,
    setBudgets,
    setTransactions,
    handleMessage,
    handleAddCategory,
    handleEditTransaction,
    handleDeleteTransaction,
    handleExportData,
    handleAddBudget,
    handleAddAccount,
    handleEditAccount,
    handleDeleteAccount,
    clearFilters,
  };
};
