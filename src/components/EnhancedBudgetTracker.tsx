import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Target, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { Transaction, Category } from '@/types/Transaction';
import { useIsMobile } from '@/hooks/use-mobile';

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  name?: string;
}

interface EnhancedBudgetTrackerProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
  onDeleteBudget: (id: string) => void;
}

export const EnhancedBudgetTracker = ({
  budgets,
  categories,
  transactions,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget
}: EnhancedBudgetTrackerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState({
    category_id: '',
    amount: 0,
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  });
  const isMobile = useIsMobile();

  const calculateSpentAmount = (budget: Budget) => {
    const categoryTransactions = transactions.filter(
      t => t.category === budget.category_id && t.type === 'expense'
    );
    
    const now = new Date();
    let startDate = new Date();
    
    if (budget.period === 'monthly') {
      startDate.setMonth(now.getMonth());
      startDate.setDate(1);
    } else if (budget.period === 'weekly') {
      const dayOfWeek = now.getDay();
      startDate.setDate(now.getDate() - dayOfWeek);
    } else if (budget.period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    
    return categoryTransactions
      .filter(t => new Date(t.date) >= startDate)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleAddBudget = () => {
    if (newBudget.category_id && newBudget.amount > 0) {
      onAddBudget(newBudget);
      setNewBudget({ category_id: '', amount: 0, period: 'monthly' });
      setIsAddDialogOpen(false);
    }
  };

  const handleUpdateBudget = () => {
    if (editingBudget) {
      onUpdateBudget(editingBudget.id, {
        category_id: editingBudget.category_id,
        amount: editingBudget.amount,
        period: editingBudget.period
      });
      setEditingBudget(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : '📊';
  };

  const getBudgetStatus = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return { color: 'destructive', text: 'Over Budget' };
    if (percentage >= 80) return { color: 'warning', text: 'Near Limit' };
    return { color: 'success', text: 'On Track' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Budget Tracker</h2>
          <p className="text-muted-foreground">Set and monitor your spending limits</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className={isMobile ? 'w-[95vw] max-w-md' : ''}>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Select value={newBudget.category_id} onValueChange={(value) => setNewBudget({ ...newBudget, category_id: value })}>
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
              
              <Input
                type="number"
                placeholder="Budget amount"
                value={newBudget.amount || ''}
                onChange={(e) => setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) || 0 })}
              />
              
              <Select value={newBudget.period} onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => setNewBudget({ ...newBudget, period: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleAddBudget} className="w-full">
                Create Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {budgets.length > 0 ? (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {budgets.map((budget) => {
            const spent = calculateSpentAmount(budget);
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const status = getBudgetStatus(spent, budget.amount);
            
            return (
              <Card key={budget.id} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getCategoryIcon(budget.category_id)}</span>
                      <div>
                        <CardTitle className="text-base text-card-foreground">
                          {getCategoryName(budget.category_id)}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground capitalize">
                          {budget.period}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingBudget(budget)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onDeleteBudget(budget.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium text-card-foreground">
                        ₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between items-center">
                      <Badge variant={status.color === 'destructive' ? 'destructive' : 'secondary'}>
                        {status.text}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {percentage >= 80 && (
                    <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-xs text-destructive">
                        {percentage >= 100 ? 'Budget exceeded!' : 'Approaching budget limit'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">No budgets set</h3>
            <p className="text-muted-foreground mb-4">
              Create your first budget to start tracking your spending limits
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-md' : ''}>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <div className="space-y-4 pt-4">
              <Select 
                value={editingBudget.category_id} 
                onValueChange={(value) => setEditingBudget({ ...editingBudget, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="Budget amount"
                value={editingBudget.amount || ''}
                onChange={(e) => setEditingBudget({ ...editingBudget, amount: parseFloat(e.target.value) || 0 })}
              />
              
              <Select 
                value={editingBudget.period} 
                onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => setEditingBudget({ ...editingBudget, period: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button onClick={handleUpdateBudget} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingBudget(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
