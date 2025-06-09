
import React from 'react';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { MetricsCards } from '@/components/MetricsCards';
import { CircularSpendingChart } from '@/components/CircularSpendingChart';
import { Transaction, Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-4 pb-20">
        <MessageInput onMessage={onMessage} accounts={accounts} />
        
        <MetricsCards
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          spentToEarnedRatio={spentToEarnedRatio}
          budget={budget}
        />

        <div className="px-1">
          <CircularSpendingChart transactions={currentMonthTransactions} />
        </div>

        <div className="px-1">
          <TransactionsList transactions={recentTransactions.slice(0, 5)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <MessageInput onMessage={onMessage} accounts={accounts} />
      
      <MetricsCards
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        spentToEarnedRatio={spentToEarnedRatio}
        budget={budget}
      />

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <CircularSpendingChart transactions={currentMonthTransactions} />
      </div>

      <TransactionsList transactions={recentTransactions} />
    </div>
  );
};
