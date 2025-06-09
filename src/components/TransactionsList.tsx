
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

  if (isMobile) {
    return (
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-card-foreground">Recent Transactions</h3>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => {
              const categoryInfo = getCategoryInfo(transaction.category);
              return (
                <div key={transaction.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
                         style={{ backgroundColor: `${categoryInfo.color}20` }}>
                      <span className="text-xl">{categoryInfo.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {categoryInfo.name}
                          </p>
                          <p className="font-medium text-card-foreground truncate text-sm">
                            {transaction.description}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className={`font-semibold text-base ${
                            transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-card-foreground'
                          }`}>
                            ₹{transaction.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.type === 'income' && (
                          <div className="text-green-600 dark:text-green-400 text-xs">✓</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs">Your transaction history will appear here</p>
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
                    ₹{transaction.amount.toLocaleString()}
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
