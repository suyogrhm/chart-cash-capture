import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction, Category, Account } from '@/types/Transaction';
import { ArrowUp, ArrowDown, Edit2, Trash2, Download, Calendar, Repeat } from 'lucide-react';

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
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : categoryId;
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

  return (
    <>
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Transaction History</h2>
          </div>
          
          <Button onClick={onExportData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className={`p-2 rounded-full w-fit ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          "{transaction.originalMessage}"
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryName(transaction.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getAccountColor(transaction.accountId) }}
                        />
                        {getAccountName(transaction.accountId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transaction.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            {transaction.recurringFrequency}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Description"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            
            <Input
              placeholder="Amount"
              type="number"
              value={editForm.amount || ''}
              onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
            />

            <Select 
              value={editForm.category || ''} 
              onValueChange={(value) => setEditForm({ ...editForm, category: value })}
            >
              <SelectTrigger>
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
              value={editForm.accountId || ''} 
              onValueChange={(value) => setEditForm({ ...editForm, accountId: value })}
            >
              <SelectTrigger>
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

            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingTransaction(null)}
                className="flex-1"
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
