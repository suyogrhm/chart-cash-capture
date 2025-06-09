
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { Budget, Category } from '@/types/Transaction';

interface BudgetTrackerProps {
  budgets: Budget[];
  categories: Category[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetTracker = ({
  budgets,
  categories,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget
}: BudgetTrackerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category_id: '',
    amount: 0,
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  });

  const handleAddBudget = () => {
    if (newBudget.category_id && newBudget.amount > 0) {
      onAddBudget(newBudget);
      setNewBudget({ category_id: '', amount: 0, period: 'monthly' });
      setIsAddDialogOpen(false);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? `${category.icon} ${category.name}` : 'Unknown Category';
  };

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (percentage >= 80) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  return (
    <>
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Budget Tracker</h2>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Select 
                  value={newBudget.category_id} 
                  onValueChange={(value) => setNewBudget({ ...newBudget, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.type === 'expense').map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Budget amount"
                  type="number"
                  value={newBudget.amount || ''}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: parseFloat(e.target.value) })}
                />

                <Select 
                  value={newBudget.period} 
                  onValueChange={(value) => setNewBudget({ ...newBudget, period: value as any })}
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

                <Button onClick={handleAddBudget} className="w-full">
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const { status, color, bgColor } = getBudgetStatus(budget);
              const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
              
              return (
                <div key={budget.id} className="p-4 bg-white rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium">{getCategoryName(budget.category_id)}</h3>
                      <Badge variant="outline">{budget.period}</Badge>
                      {status === 'exceeded' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className={`text-right ${color}`}>
                      <p className="font-semibold">
                        ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                      </p>
                      <p className="text-sm">
                        {percentage.toFixed(1)}% used
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Remaining: ${(budget.amount - budget.spent).toFixed(2)}</span>
                      <span>
                        {status === 'exceeded' ? 'Over budget!' : 
                         status === 'warning' ? 'Close to limit' : 'On track'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No budgets set</p>
            <p className="text-sm">Create budgets to track your spending goals</p>
          </div>
        )}
      </Card>
    </>
  );
};
