
import React from 'react';
import { MessageInput } from '@/components/MessageInput';
import { TransactionsList } from '@/components/TransactionsList';
import { MetricsCards } from '@/components/MetricsCards';
import { SpendingChart } from '@/components/SpendingChart';
import { Transaction, Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileDashboardProps {
  onMessage: (message: string, accountId?: string, paymentMethod?: string) => void;
  currentMonthTransactions: Transaction[];
  recentTransactions: Transaction[];
  totalIncome: number;
  totalExpenses: number;
  spentToEarnedRatio: number;
  budget: number;
  accounts: Account[];
}

export const MobileDashboard = ({
  onMessage,
  currentMonthTransactions,
  recentTransactions,
  totalIncome,
  totalExpenses,
  spentToEarnedRatio,
  budget,
  accounts
}: MobileDashboardProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
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
        </div>

        <TransactionsList transactions={recentTransactions} />
      </div>
    );
  }

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
        <SpendingChart transactions={currentMonthTransactions} />
      </div>

      <div className="px-1">
        <TransactionsList transactions={recentTransactions.slice(0, 5)} />
      </div>
    </div>
  );
};
