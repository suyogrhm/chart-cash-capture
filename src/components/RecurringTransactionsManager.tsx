import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Repeat, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { Category, Account } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  next_execution: string;
  payment_method?: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
}

interface RecurringTransactionsManagerProps {
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  accounts: Account[];
  onAddRecurring: (recurring: Omit<RecurringTransaction, 'id'>) => void;
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
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [newRecurring, setNewRecurring] = useState({
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    account_id: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    start_date: new Date().toISOString().split('T')[0],
    is_active: true,
    payment_method: 'upi' as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other'
  });
  const isMobile = useIsMobile();

  const handleAddRecurring = () => {
    if (newRecurring.description && newRecurring.amount > 0 && newRecurring.category_id && newRecurring.account_id) {
      const nextExecution = calculateNextExecution(newRecurring.start_date, newRecurring.frequency);
      onAddRecurring({
        ...newRecurring,
        next_execution: nextExecution
      });
      setNewRecurring({
        description: '',
        amount: 0,
        type: 'expense',
        category_id: '',
        account_id: '',
        frequency: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        is_active: true,
        payment_method: 'upi'
      });
      setIsAddDialogOpen(false);
    }
  };

  const calculateNextExecution = (startDate: string, frequency: string) => {
    const date = new Date(startDate);
    const now = new Date();
    
    while (date <= now) {
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
    }
    
    return date.toISOString().split('T')[0];
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📊';
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown';
  };

  const getAccountColor = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.color : '#6B7280';
  };

  const formatNextExecution = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Recurring Transactions</h3>
          <p className="text-sm text-muted-foreground">Automate your regular income and expenses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent className={isMobile ? 'w-[95vw] max-w-md' : ''}>
            <DialogHeader>
              <DialogTitle>Create Recurring Transaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Description"
                value={newRecurring.description}
                onChange={(e) => setNewRecurring({ ...newRecurring, description: e.target.value })}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newRecurring.amount || ''}
                  onChange={(e) => setNewRecurring({ ...newRecurring, amount: parseFloat(e.target.value) || 0 })}
                />
                <Select value={newRecurring.type} onValueChange={(value: 'income' | 'expense') => setNewRecurring({ ...newRecurring, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Select value={newRecurring.category_id} onValueChange={(value) => setNewRecurring({ ...newRecurring, category_id: value })}>
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
              
              <Select value={newRecurring.account_id} onValueChange={(value) => setNewRecurring({ ...newRecurring, account_id: value })}>
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
              
              <div className="grid grid-cols-2 gap-2">
                <Select value={newRecurring.frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setNewRecurring({ ...newRecurring, frequency: value })}>
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
                <Input
                  type="date"
                  value={newRecurring.start_date}
                  onChange={(e) => setNewRecurring({ ...newRecurring, start_date: e.target.value })}
                />
              </div>
              
              <Button onClick={handleAddRecurring} className="w-full">
                Create Recurring Transaction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {recurringTransactions.length > 0 ? (
        <div className="space-y-4">
          {recurringTransactions.map((recurring) => (
            <Card key={recurring.id} className={`bg-card border-border ${!recurring.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      recurring.type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <span className="text-xl">{getCategoryIcon(recurring.category_id)}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-card-foreground truncate">
                          {recurring.description}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryName(recurring.category_id)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: getAccountColor(recurring.account_id) }}
                          />
                          <span>{getAccountName(recurring.account_id)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          <span className="capitalize">{recurring.frequency}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatNextExecution(recurring.next_execution)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${
                        recurring.type === 'income' ? 'text-green-600' : 'text-card-foreground'
                      }`}>
                        ₹{recurring.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Switch
                          checked={recurring.is_active}
                          onCheckedChange={(checked) => onToggleActive(recurring.id, checked)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {recurring.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingRecurring(recurring)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteRecurring(recurring.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-8">
            <Repeat className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No recurring transactions</h3>
            <p className="text-muted-foreground mb-4">
              Set up automatic transactions for regular income and expenses
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring Transaction
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
