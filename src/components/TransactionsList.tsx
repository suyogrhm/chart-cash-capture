
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

  const getCategoryInfo = (categoryId: string) => {
    const categories: { [key: string]: { name: string; icon: string } } = {
      '1': { name: 'Food & Dining', icon: '🍽️' },
      '2': { name: 'Transportation', icon: '🚗' },
      '3': { name: 'Entertainment', icon: '🎮' },
      '4': { name: 'Bills & Utilities', icon: '⚡' },
      '5': { name: 'Shopping', icon: '🛒' },
      '6': { name: 'Fuel', icon: '⛽' },
      '7': { name: 'Salary', icon: '💰' },
      '8': { name: 'Freelance', icon: '💼' },
    };
    return categories[categoryId] || { name: 'Other', icon: '💳' };
  };

  if (isMobile) {
    return (
      <Card className="bg-white border-0 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {transactions.map((transaction) => {
              const categoryInfo = getCategoryInfo(transaction.category);
              return (
                <div key={transaction.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      <span className="text-xl">{categoryInfo.icon}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {categoryInfo.name}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className={`font-semibold text-base ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-slate-900'
                          }`}>
                            ₹{transaction.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.type === 'income' && (
                          <div className="text-green-600 text-xs">✓</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transactions yet</p>
            <p className="text-xs">Your transaction history will appear here</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const categoryInfo = getCategoryInfo(transaction.category);
            return (
              <div 
                key={transaction.id} 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    <span className="text-xl">{categoryInfo.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {transaction.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {categoryInfo.name}
                      </Badge>
                    </div>
                    {transaction.original_message && (
                      <p className="text-muted-foreground truncate text-sm">
                        "{transaction.original_message}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-slate-900'
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
