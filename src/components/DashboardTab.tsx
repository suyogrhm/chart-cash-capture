
import React from 'react';
import { SpendingChart } from '@/components/SpendingChart';
import { MetricsCards } from '@/components/MetricsCards';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { Transaction } from '@/types/Transaction';

interface DashboardTabProps {
  onMessage: (message: string) => void;
  currentMonthTransactions: Transaction[];
  recentTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  spentToEarnedRatio: number;
  budget: number;
}

export const DashboardTab = ({
  onMessage,
  currentMonthTransactions,
  recentTransactions,
  totalIncome,
  totalExpenses,
  spentToEarnedRatio,
  budget
}: DashboardTabProps) => {
  return (
    <div className="space-y-6">
      <MessageInput onMessage={onMessage} />
      
      {/* Circular Chart */}
      <SpendingChart transactions={currentMonthTransactions} />
      
      {/* Metrics Cards */}
      <MetricsCards 
        totalIncome={totalIncome}
        budget={budget}
        spentToEarnedRatio={spentToEarnedRatio}
        totalExpenses={totalExpenses}
      />
      
      {/* Recent Transactions */}
      <TransactionsList transactions={recentTransactions} />
    </div>
  );
};
