import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/Transaction';
import { Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCategoryInfo } from '@/utils/categoryUtils';

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

  const formatAmount = (amount: number) => {
    if (isMobile && amount >= 1000) {
      return `₹${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  if (isMobile) {
    return (
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <div className="p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground text-xs">Recent Transactions</h3>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-border/50">
            {transactions.map((transaction) => {
              const categoryInfo = getCategoryInfo(transaction.category);
              return (
                <div key={transaction.id} className="p-2 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-border/20`}
                         style={{ backgroundColor: `${categoryInfo.color}15` }}>
                      <span className="text-xs">{categoryInfo.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-medium text-muted-foreground mb-0.5">
                            {categoryInfo.name}
                          </p>
                          <p className="font-semibold text-card-foreground truncate text-xs">
                            {transaction.description}
                          </p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className={`font-bold text-xs ${
                            transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-card-foreground'
                          }`}>
                            {formatAmount(transaction.amount)}
                          </p>
                          {transaction.type === 'income' && (
                            <div className="text-green-600 dark:text-green-400 text-[8px] flex justify-end mt-0.5">✓</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-[8px] text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No transactions yet</p>
            <p className="text-[10px]">Your transaction history will appear here</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Recent Transactions</h2>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const categoryInfo = getCategoryInfo(transaction.category);
            return (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 bg-muted/30 dark:bg-muted/20 rounded-xl hover:shadow-md hover:bg-muted/50 dark:hover:bg-muted/30 transition-all border border-border/50"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center`}
                       style={{ backgroundColor: `${categoryInfo.color}20` }}>
                    <span className="text-xl">{categoryInfo.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs bg-muted-foreground/10 text-muted-foreground border-0">
                        {categoryInfo.name}
                      </Badge>
                    </div>
                    <p className="font-medium truncate text-card-foreground">
                      {transaction.description}
                    </p>
                    {transaction.original_message && (
                      <p className="text-muted-foreground truncate text-sm mt-1">
                        "{transaction.original_message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-card-foreground'
                  }`}>
                    {formatAmount(transaction.amount)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No transactions yet</p>
          <p className="text-sm">Your transaction history will appear here</p>
        </div>
      )}
    </Card>
  );
};
