
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, TrendingUp, AlertTriangle, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { Budget, Category } from '@/types/Transaction';
import { Label } from '@/components/ui/label';

interface EnhancedBudgetTrackerProps {
  budgets: Budget[];
  categories: Category[];
  onAddBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
  onDeleteBudget: (id: string) => void;
  transactions: any[];
}

export const EnhancedBudgetTracker = ({
  budgets,
  categories,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
  transactions
}: EnhancedBudgetTrackerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    name: '',
    amount: '',
    category_id: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    alert_threshold: '80'
  });

  const calculateBudgetProgress = (budget: Budget) => {
    const currentDate = new Date();
    let startDate = new Date();
    
    switch (budget.period) {
      case 'weekly':
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        break;
      case 'monthly':
        startDate.setDate(1);
        break;
      case 'yearly':
        startDate.setMonth(0, 1);
        break;
    }

    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && 
             transactionDate <= currentDate &&
             t.category === budget.category_id &&
             t.type === 'expense';
    });

    const spent = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = (spent / budget.amount) * 100;
    
    return { spent, percentage, transactions: periodTransactions };
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return 'exceeded';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'caution';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'caution': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'caution': return <TrendingUp className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleAddBudget = () => {
    if (newBudget.name.trim() && newBudget.amount && newBudget.category_id) {
      onAddBudget({
        name: newBudget.name,
        amount: parseFloat(newBudget.amount),
        category_id: newBudget.category_id,
        period: newBudget.period,
        alert_threshold: parseFloat(newBudget.alert_threshold)
      });
      
      setNewBudget({
        name: '',
        amount: '',
        category_id: '',
        period: 'monthly',
        alert_threshold: '80'
      });
      setIsAddDialogOpen(false);
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category || { name: 'Unknown', icon: '❓', color: '#666' };
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const { spent } = calculateBudgetProgress(b);
    return sum + spent;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Total Budget</h3>
          </div>
          <p className="text-2xl font-bold">₹{totalBudget.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <h3 className="font-medium">Total Spent</h3>
          </div>
          <p className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <h3 className="font-medium">Remaining</h3>
          </div>
          <p className="text-2xl font-bold">₹{(totalBudget - totalSpent).toLocaleString()}</p>
        </Card>
      </div>

      {/* Budget Management */}
      <Card className="p-6 bg-card border-border shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Budget Goals</h2>
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
                <DialogTitle>Create Budget Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="budget-name">Budget Name</Label>
                  <Input
                    id="budget-name"
                    placeholder="e.g., Monthly Food Budget"
                    value={newBudget.name}
                    onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="budget-amount">Amount</Label>
                  <Input
                    id="budget-amount"
                    type="number"
                    placeholder="0.00"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="budget-category">Category</Label>
                  <Select value={newBudget.category_id} onValueChange={(value) => setNewBudget({ ...newBudget, category_id: value })}>
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
                </div>

                <div>
                  <Label htmlFor="budget-period">Period</Label>
                  <Select value={newBudget.period} onValueChange={(value) => setNewBudget({ ...newBudget, period: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="alert-threshold">Alert Threshold (%)</Label>
                  <Input
                    id="alert-threshold"
                    type="number"
                    min="0"
                    max="100"
                    value={newBudget.alert_threshold}
                    onChange={(e) => setNewBudget({ ...newBudget, alert_threshold: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddBudget} className="w-full">
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No budget goals set</p>
              <p className="text-sm">Create budget goals to track your spending</p>
            </div>
          ) : (
            budgets.map((budget) => {
              const { spent, percentage } = calculateBudgetProgress(budget);
              const status = getBudgetStatus(percentage);
              const categoryInfo = getCategoryInfo(budget.category_id);
              
              return (
                <div
                  key={budget.id}
                  className="p-4 bg-muted/30 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: categoryInfo.color }}
                      >
                        {categoryInfo.icon}
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">{budget.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {budget.period}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {categoryInfo.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="text-sm font-medium">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₹{spent.toLocaleString()} / ₹{budget.amount.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeleteBudget(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="w-full h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹{(budget.amount - spent).toLocaleString()} remaining</span>
                      <span>{Math.max(0, 100 - percentage).toFixed(0)}% left</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};
