
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
  const isMobile = useIsMobile();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm(transaction);
  };

  const handleSaveEdit = () => {
    if (editingTransaction && editForm) {
      onEditTransaction(editingTransaction.id, editForm);
      setEditingTransaction(null);
      setEditForm({});
    }
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

  const getCategoryInfo = (categoryId: string) => {
    const categoryMapping: { [key: string]: { name: string; icon: string } } = {
      '1': { name: 'Food & Dining', icon: '🍽️' },
      '2': { name: 'Transportation', icon: '🚗' },
      '3': { name: 'Entertainment', icon: '🎮' },
      '4': { name: 'Bills & Utilities', icon: '⚡' },
      '5': { name: 'Shopping', icon: '🛒' },
      '6': { name: 'Fuel', icon: '⛽' },
      '7': { name: 'Salary', icon: '💰' },
      '8': { name: 'Freelance', icon: '💼' },
    };
    return categoryMapping[categoryId] || { name: 'Other', icon: '💳' };
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

  // Mobile card view for better UX
  const MobileTransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const categoryInfo = getCategoryInfo(transaction.category);
    return (
      <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
            }`}>
              <span className="text-xl">{categoryInfo.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-card-foreground text-xs mb-1">{categoryInfo.name}</p>
              <p className="font-semibold text-card-foreground text-sm mb-1">{transaction.description}</p>
              {transaction.original_message && (
                <p className="text-xs text-muted-foreground truncate">
                  "{transaction.original_message}"
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className={`text-lg font-bold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-card-foreground'
            }`}>
              ₹{transaction.amount.toLocaleString()}
            </p>
            {transaction.type === 'income' && (
              <div className="text-green-600 text-xs flex justify-end mt-1">✓</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{formatDate(transaction.date)}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: getAccountColor(transaction.account_id) }}
            />
            <span className="text-xs text-muted-foreground">
              {getAccountName(transaction.account_id)}
            </span>
            {transaction.is_recurring && (
              <Badge variant="outline" className="text-xs ml-2">
                <Repeat className="h-2 w-2 mr-1" />
                {transaction.recurring_frequency}
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-muted"
              onClick={() => handleEdit(transaction)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
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
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className={`font-semibold text-card-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>
              Transaction History
            </h2>
          </div>
        </div>

        {transactions.length > 0 ? (
          <div className="p-6">
            {isMobile ? (
              // Mobile: Card layout
              <div className="space-y-4">
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
                      <TableHead className="text-muted-foreground bg-muted/30">Status</TableHead>
                      <TableHead className="text-muted-foreground bg-muted/30">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => {
                      const categoryInfo = getCategoryInfo(transaction.category);
                      return (
                        <TableRow key={transaction.id} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
                            }`}>
                              <span className="text-lg">{categoryInfo.icon}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-card-foreground text-xs mb-1">{categoryInfo.name}</p>
                              <p className="font-semibold text-card-foreground">{transaction.description}</p>
                              {transaction.original_message && (
                                <p className="text-sm text-muted-foreground truncate max-w-xs">
                                  "{transaction.original_message}"
                                </p>
                              )}
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
                              transaction.type === 'income' ? 'text-green-600' : 'text-card-foreground'
                            }`}>
                              ₹{transaction.amount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {transaction.is_recurring && (
                                <Badge variant="outline" className="text-xs">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  {transaction.recurring_frequency}
                                </Badge>
                              )}
                              {transaction.type === 'income' && (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">
                                  ✓ Received
                                </Badge>
                              )}
                            </div>
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
    </>
  );
};
