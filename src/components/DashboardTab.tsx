
import React from 'react';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { MetricsCards } from '@/components/MetricsCards';
import { SpendingChart } from '@/components/SpendingChart';
import { CircularSpendingChart } from '@/components/CircularSpendingChart';
import { Transaction, Account } from '@/types/Transaction';

interface DashboardTabProps {
  onMessage: (message: string, accountId?: string, paymentMethod?: string) => void;
  currentMonthTransactions: Transaction[];
  recentTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  spentToEarnedRatio: number;
  budget: number;
  accounts: Account[];
}

export const DashboardTab = ({
  onMessage,
  currentMonthTransactions,
  recentTransactions,
  totalIncome,
  totalExpenses,
  spentToEarnedRatio,
  budget,
  accounts
}: DashboardTabProps) => {
  return (
    <div className="space-y-8">
      <MessageInput onMessage={onMessage} accounts={accounts} />
      
      <MetricsCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        spentToEarnedRatio={spentToEarnedRatio}
        budget={budget}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart transactions={currentMonthTransactions} />
        <CircularSpendingChart transactions={currentMonthTransactions} />
      </div>

      <TransactionsList transactions={recentTransactions} />
    </div>
  );
};
