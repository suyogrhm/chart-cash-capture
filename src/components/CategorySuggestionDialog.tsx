
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSimilarCategories, getCategoryInfo } from '@/utils/categoryUtils';
import { Transaction } from '@/types/Transaction';

interface CategorySuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  newCategoryId: string;
  similarTransactions: Transaction[];
  onConfirmGrouping: (transactionIds: string[], categoryId: string) => void;
}

export const CategorySuggestionDialog = ({
  isOpen,
  onClose,
  transaction,
  newCategoryId,
  similarTransactions,
  onConfirmGrouping
}: CategorySuggestionDialogProps) => {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const newCategoryInfo = getCategoryInfo(newCategoryId);

  const handleTransactionToggle = (transactionId: string) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const handleConfirm = () => {
    onConfirmGrouping([transaction.id, ...selectedTransactions], newCategoryId);
    onClose();
    setSelectedTransactions([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{newCategoryInfo.icon}</span>
            Group Similar Transactions
          </DialogTitle>
          <DialogDescription>
            Found similar transactions that might belong to the same category: {newCategoryInfo.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Select other transactions to group with "{transaction.description}":
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {similarTransactions.map((similarTransaction) => (
              <div 
                key={similarTransaction.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTransactions.includes(similarTransaction.id)
                    ? 'bg-primary/10 border-primary'
                    : 'bg-card hover:bg-muted/50'
                }`}
                onClick={() => handleTransactionToggle(similarTransaction.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{similarTransaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      ₹{similarTransaction.amount.toLocaleString()} • {new Date(similarTransaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-2">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(similarTransaction.id)}
                      onChange={() => handleTransactionToggle(similarTransaction.id)}
                      className="rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTransactions.length > 0 && (
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">
                Will update {selectedTransactions.length + 1} transaction(s) to:
              </p>
              <Badge variant="secondary" className="text-xs">
                {newCategoryInfo.icon} {newCategoryInfo.name}
              </Badge>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleConfirm} className="flex-1" size="sm">
              Group Selected ({selectedTransactions.length + 1})
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1" size="sm">
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
