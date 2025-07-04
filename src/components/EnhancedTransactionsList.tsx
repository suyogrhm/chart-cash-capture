
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, Category, Account } from '@/types/Transaction';
import { ArrowUp, ArrowDown, Edit2, Trash2, Clock, Repeat } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getCategoryInfo } from '@/utils/categoryUtils';
import { CategorySuggestionDialog } from '@/components/CategorySuggestionDialog';

interface EnhancedTransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  onEditTransaction: (id: string, updates: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  onExportData: () => void;
}

export const EnhancedTransactionsList = ({
  transactions,
  categories,
  accounts,
  onEditTransaction,
  onDeleteTransaction,
  onExportData
}: EnhancedTransactionsListProps) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [suggestionData, setSuggestionData] = useState<{
    transaction: Transaction;
    newCategoryId: string;
    similarTransactions: Transaction[];
  } | null>(null);
  const isMobile = useIsMobile();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm(transaction);
  };

  const findSimilarTransactions = (currentTransaction: Transaction, newCategoryId: string): Transaction[] => {
    const keywords = currentTransaction.description.toLowerCase().split(' ');
    
    return transactions.filter(t => 
      t.id !== currentTransaction.id &&
      t.category !== newCategoryId &&
      keywords.some(keyword => 
        keyword.length > 3 && t.description.toLowerCase().includes(keyword)
      )
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const handleSaveEdit = () => {
    if (editingTransaction && editForm) {
      // Check if category changed and find similar transactions
      if (editForm.category && editForm.category !== editingTransaction.category) {
        const similarTransactions = findSimilarTransactions(editingTransaction, editForm.category);
        
        if (similarTransactions.length > 0) {
          setSuggestionData({
            transaction: editingTransaction,
            newCategoryId: editForm.category,
            similarTransactions
          });
          setShowSuggestionDialog(true);
          setEditingTransaction(null);
          setEditForm({});
          return;
        }
      }
      
      onEditTransaction(editingTransaction.id, editForm);
      setEditingTransaction(null);
      setEditForm({});
    }
  };

  const handleConfirmGrouping = (transactionIds: string[], categoryId: string) => {
    transactionIds.forEach(id => {
      onEditTransaction(id, { category: categoryId });
    });
    setShowSuggestionDialog(false);
    setSuggestionData(null);
  };

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'Default';
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown';
  };

  const getAccountColor = (accountId?: string) => {
    if (!accountId) return '#6B7280';
    const account = accounts.find(a => a.id === accountId);
    return account ? account.color : '#6B7280';
  };

  const getPaymentMethodDisplay = (paymentMethod?: string) => {
    const methods = {
      cash: '💵 Cash',
      upi: '📱 UPI',
      card: '💳 Card',
      bank_transfer: '🏦 Bank Transfer',
      other: '📝 Other'
    };
    return paymentMethod ? methods[paymentMethod as keyof typeof methods] || paymentMethod : '—';
  };

  // Enhanced mobile card view with better UI
  const MobileTransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const categoryInfo = getCategoryInfo(transaction.category);
    return (
      <div className="bg-card rounded-lg border border-border/30 p-3 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-border/20`}
                 style={{ 
                   backgroundColor: transaction.type === 'income' 
                     ? 'hsl(var(--success)/0.1)' 
                     : `${categoryInfo.color}15`
                 }}>
              <span className="text-sm" style={{ 
                filter: 'contrast(1.2) brightness(0.9)',
                color: transaction.type === 'income' ? 'hsl(var(--success))' : categoryInfo.color
              }}>
                {categoryInfo.icon}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-muted/50 text-muted-foreground border-border/50">
                  {categoryInfo.name}
                </Badge>
              </div>
              <p className="font-medium text-card-foreground text-sm leading-tight mb-1">
                {transaction.description}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0 ml-2">
            <p className={`font-bold text-base ${
              transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-card-foreground'
            }`}>
              ₹{transaction.amount.toLocaleString()}
            </p>
            {transaction.type === 'income' && (
              <div className="text-green-600 dark:text-green-400 text-[10px] flex justify-end">✓</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: getAccountColor(transaction.account_id) }}
            />
            <span>{getAccountName(transaction.account_id)}</span>
          </div>
          <span>{formatDate(transaction.date)}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-1">
            {transaction.is_recurring && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                <Repeat className="h-2 w-2 mr-0.5" />
                {transaction.recurring_frequency}
              </Badge>
            )}
            {transaction.payment_method && (
              <span className="text-[10px] text-muted-foreground">
                {getPaymentMethodDisplay(transaction.payment_method)}
              </span>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => handleEdit(transaction)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDeleteTransaction(transaction.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="bg-card border-border shadow-lg overflow-hidden">
        <div className={`${isMobile ? 'p-3' : 'p-6'} border-b border-border`}>
          <div className="flex items-center gap-3">
            <Clock className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-primary`} />
            <h2 className={`font-semibold text-card-foreground ${isMobile ? 'text-sm' : 'text-lg'}`}>
              Transaction History
            </h2>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className={isMobile ? 'p-2' : 'p-6'}>
            {isMobile ? (
              // Mobile: Enhanced card layout
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <MobileTransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              // Desktop: Table layout
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      <TableHead className="text-muted-foreground bg-muted/30">Type</TableHead>
                      <TableHead className="text-muted-foreground bg-muted/30">Category & Description</TableHead>
                      <TableHead className="text-muted-foreground bg-muted/30">Account</TableHead>
                      <TableHead className="text-muted-foreground bg-muted/30">Payment Method</TableHead>
                      <TableHead className="text-muted-foreground bg-muted/30">Amount</TableHead>
                      <TableHead className="text-muted-foreground bg-muted/30">Date</TableHead>
                      <TableHead className="text-muted-foreground bg-muted/30">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const categoryInfo = getCategoryInfo(transaction.category);
                      return (
                        <TableRow key={transaction.id} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-border/20`} 
                                 style={{ 
                                   backgroundColor: transaction.type === 'income' 
                                     ? 'hsl(var(--success)/0.1)' 
                                     : `${categoryInfo.color}15`
                                 }}>
                              <span className="text-lg" style={{ 
                                filter: 'contrast(1.2) brightness(0.9)',
                                color: transaction.type === 'income' ? 'hsl(var(--success))' : categoryInfo.color
                              }}>
                                {categoryInfo.icon}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-card-foreground text-xs mb-1">{categoryInfo.name}</p>
                              <p className="font-semibold text-card-foreground">{transaction.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: getAccountColor(transaction.account_id) }}
                              />
                              <span className="text-sm text-card-foreground">{getAccountName(transaction.account_id)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-card-foreground">
                            {getPaymentMethodDisplay(transaction.payment_method)}
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold text-lg ${
                              transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-card-foreground'
                            }`}>
                              ₹{transaction.amount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-muted"
                                onClick={() => handleEdit(transaction)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => onDeleteTransaction(transaction.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-md' : ''}>
          <DialogHeader>
            <DialogTitle className={isMobile ? 'text-base' : ''}>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            
            <Input
              placeholder="Description"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className={isMobile ? 'text-sm' : ''}
            />
            
            <Input
              placeholder="Amount"
              type="number"
              value={editForm.amount || ''}
              onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
              className={isMobile ? 'text-sm' : ''}
            />

            <Select 
              value={editForm.category || ''} 
              onValueChange={(value) => setEditForm({ ...editForm, category: value })}
            >
              <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={editForm.account_id || ''} 
              onValueChange={(value) => setEditForm({ ...editForm, account_id: value })}
            >
              <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: account.color }}
                      />
                      {account.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={editForm.payment_method || ''} 
              onValueChange={(value) => setEditForm({ ...editForm, payment_method: value as any })}
            >
              <SelectTrigger className={isMobile ? 'text-sm' : ''}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="upi">📱 UPI</SelectItem>
                <SelectItem value="card">💳 Card</SelectItem>
                <SelectItem value="bank_transfer">🏦 Bank Transfer</SelectItem>
                <SelectItem value="other">📝 Other</SelectItem>
              </SelectContent>
            </Select>

            <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
              <Button onClick={handleSaveEdit} className={`${isMobile ? 'w-full text-sm' : 'flex-1'}`}>
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingTransaction(null)}
                className={`${isMobile ? 'w-full text-sm' : 'flex-1'}`}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Suggestion Dialog */}
      {suggestionData && (
        <CategorySuggestionDialog
          isOpen={showSuggestionDialog}
          onClose={() => setShowSuggestionDialog(false)}
          transaction={suggestionData.transaction}
          newCategoryId={suggestionData.newCategoryId}
          similarTransactions={suggestionData.similarTransactions}
          onConfirmGrouping={handleConfirmGrouping}
        />
      )}
    </>
  );
};
