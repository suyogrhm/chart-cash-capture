
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Repeat, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { Transaction, Category, Account } from '@/types/Transaction';
import { Label } from '@/components/ui/label';

interface RecurringTransaction extends Omit<Transaction, 'id' | 'date'> {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
}

interface RecurringTransactionsManagerProps {
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  accounts: Account[];
  onAddRecurring: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  onEditRecurring: (id: string, updates: Partial<RecurringTransaction>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export const RecurringTransactionsManager = ({
  recurringTransactions,
  categories,
  accounts,
  onAddRecurring,
  onEditRecurring,
  onDeleteRecurring,
  onToggleActive
}: RecurringTransactionsManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRecurring, setNewRecurring] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    account_id: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true
  });

  const handleAddRecurring = () => {
    if (newRecurring.description.trim() && newRecurring.amount && newRecurring.category && newRecurring.account_id) {
      const nextDueDate = calculateNextDueDate(newRecurring.start_date, newRecurring.frequency);
      
      onAddRecurring({
        ...newRecurring,
        amount: parseFloat(newRecurring.amount),
        next_due_date: nextDueDate,
        start_date: newRecurring.start_date,
        end_date: newRecurring.end_date || undefined
      });
      
      setNewRecurring({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        account_id: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        is_active: true
      });
      setIsAddDialogOpen(false);
    }
  };

  const calculateNextDueDate = (startDate: string, frequency: string) => {
    const date = new Date(startDate);
    const today = new Date();
    
    // If start date is in the future, return it
    if (date > today) return startDate;
    
    // Calculate next occurrence
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const formatFrequency = (frequency: string) => {
    const map = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    };
    return map[frequency as keyof typeof map] || frequency;
  };

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: 'Unknown', icon: '❓' };
  };

  const getAccountInfo = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account || { name: 'Unknown Account' };
  };

  return (
    <Card className="p-6 bg-card border-border shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Repeat className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">Recurring Transactions</h2>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Recurring Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Transaction description"
                  value={newRecurring.description}
                  onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={newRecurring.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setNewRecurring({ ...newRecurring, type: 'expense' })}
                  >
                    Expense
                  </Button>
                  <Button
                    variant={newRecurring.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setNewRecurring({ ...newRecurring, type: 'income' })}
                  >
                    Income
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newRecurring.category} onValueChange={(value) => setNewRecurring({ ...newRecurring, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.type === newRecurring.type).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="account">Account</Label>
                <Select value={newRecurring.account_id} onValueChange={(value) => setNewRecurring({ ...newRecurring, account_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newRecurring.frequency} onValueChange={(value) => setNewRecurring({ ...newRecurring, frequency: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newRecurring.start_date}
                  onChange={(e) => setNewRecurring({ ...newRecurring, start_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date (Optional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newRecurring.end_date}
                  onChange={(e) => setNewRecurring({ ...newRecurring, end_date: e.target.value })}
                />
              </div>

              <Button onClick={handleAddRecurring} className="w-full">
                Add Recurring Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {recurringTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No recurring transactions set up</p>
            <p className="text-sm">Create automated transactions for regular income or expenses</p>
          </div>
        ) : (
          recurringTransactions.map((recurring) => {
            const categoryInfo = getCategoryInfo(recurring.category);
            const accountInfo = getAccountInfo(recurring.account_id);
            
            return (
              <div
                key={recurring.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: categoryInfo.color || '#666' }}
                  >
                    {categoryInfo.icon}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-card-foreground">{recurring.description}</p>
                      <Badge variant={recurring.type === 'income' ? 'default' : 'secondary'}>
                        {recurring.type}
                      </Badge>
                      <Badge variant="outline">
                        {formatFrequency(recurring.frequency)}
                      </Badge>
                      {!recurring.is_active && (
                        <Badge variant="destructive">Paused</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{categoryInfo.name}</span>
                      <span>•</span>
                      <span>{accountInfo.name}</span>
                      <span>•</span>
                      <span>Next: {new Date(recurring.next_due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      recurring.type === 'income' ? 'text-green-600' : 'text-card-foreground'
                    }`}>
                      ₹{recurring.amount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleActive(recurring.id, !recurring.is_active)}
                    >
                      {recurring.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteRecurring(recurring.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
