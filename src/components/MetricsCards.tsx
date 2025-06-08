
import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Target, TrendingUp } from 'lucide-react';

interface MetricsCardsProps {
  totalIncome: number;
  budget: number;
  spentToEarnedRatio: number;
  totalExpenses: number;
}

export const MetricsCards = ({ 
  totalIncome, 
  budget, 
  spentToEarnedRatio, 
  totalExpenses 
}: MetricsCardsProps) => {
  const budgetUsed = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const remainingBudget = budget - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Income Card */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <ArrowUp className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          This month's earnings
        </div>
      </Card>

      {/* Budget Card */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Budget Status</p>
            <p className="text-3xl font-bold text-blue-600">${remainingBudget.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Used: {budgetUsed.toFixed(1)}%</span>
            <span>${budget.toFixed(2)} total</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(budgetUsed, 100)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Spent to Earned Ratio Card */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Spent/Earned Ratio</p>
            <p className={`text-3xl font-bold ${
              spentToEarnedRatio > 100 ? 'text-red-600' : 
              spentToEarnedRatio > 80 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {spentToEarnedRatio.toFixed(1)}%
            </p>
          </div>
          <div className={`p-3 rounded-full ${
            spentToEarnedRatio > 100 ? 'bg-red-100' : 
            spentToEarnedRatio > 80 ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            <TrendingUp className={`h-6 w-6 ${
              spentToEarnedRatio > 100 ? 'text-red-600' : 
              spentToEarnedRatio > 80 ? 'text-yellow-600' : 'text-green-600'
            }`} />
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          {spentToEarnedRatio > 100 ? 'Spending exceeds income' :
           spentToEarnedRatio > 80 ? 'High spending ratio' : 'Healthy spending ratio'}
        </div>
      </Card>
    </div>
  );
};
