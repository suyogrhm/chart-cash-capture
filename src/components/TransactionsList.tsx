
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/Transaction';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsList = ({ transactions }: TransactionsListProps) => {
  const isMobile = useIsMobile();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isMobile) {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>
          Recent Transactions
        </h2>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className={`flex items-center justify-between bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow ${
                isMobile ? 'p-3' : 'p-4'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`rounded-full ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                } ${isMobile ? 'p-1.5' : 'p-2'}`}>
                  {transaction.type === 'income' ? (
                    <ArrowUp className={`text-green-600 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  ) : (
                    <ArrowDown className={`text-red-600 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium truncate ${isMobile ? 'text-sm' : ''}`}>
                      {transaction.description}
                    </p>
                    <Badge variant="secondary" className={isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs'}>
                      {transaction.category}
                    </Badge>
                  </div>
                  {transaction.original_message && (
                    <p className={`text-muted-foreground truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      "{transaction.original_message}"
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                } ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
                <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className={isMobile ? 'text-sm' : ''}>No transactions yet</p>
          <p className={isMobile ? 'text-xs' : 'text-sm'}>Your transaction history will appear here</p>
        </div>
      )}
    </Card>
  );
};
