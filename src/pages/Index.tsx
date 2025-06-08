
import React, { useState, useEffect } from 'react';
import { SpendingChart } from '@/components/SpendingChart';
import { MetricsCards } from '@/components/MetricsCards';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { parseMessage } from '@/utils/messageParser';
import { Transaction } from '@/types/Transaction';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState(2000); // Default budget

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('expense-tracker-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expense-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleMessage = (message: string) => {
    const parsedTransaction = parseMessage(message);
    if (parsedTransaction) {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...parsedTransaction,
        date: new Date().toISOString(),
        originalMessage: message
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  // Calculate metrics
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const spentToEarnedRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your finances with natural language
          </p>
        </div>

        {/* Message Input */}
        <div className="mb-8">
          <MessageInput onMessage={handleMessage} />
        </div>

        {/* Spending Chart */}
        <div className="mb-8">
          <SpendingChart transactions={currentMonthTransactions} />
        </div>

        {/* Metrics Cards */}
        <div className="mb-8">
          <MetricsCards 
            totalIncome={totalIncome}
            budget={budget}
            spentToEarnedRatio={spentToEarnedRatio}
            totalExpenses={totalExpenses}
          />
        </div>

        {/* Recent Transactions */}
        <TransactionsList transactions={transactions.slice(0, 10)} />
      </div>
    </div>
  );
};

export default Index;
