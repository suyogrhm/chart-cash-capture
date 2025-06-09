
import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Target, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const budgetUsed = budget > 0 ? (totalExpenses / budget) * 100 : 0;
  const remainingBudget = budget - totalExpenses;

  if (isMobile) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {/* Income Card - Mobile */}
        <Card className="p-2 bg-card/95 backdrop-blur-sm border-border/50 shadow-md">
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Income</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                ₹{(totalIncome / 1000).toFixed(0)}K
              </p>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mx-auto mt-0.5" />
            </div>
          </div>
        </Card>

        {/* Budget Card - Mobile */}
        <Card className="p-2 bg-card/95 backdrop-blur-sm border-border/50 shadow-md">
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Target className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Budget</p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                ₹{(budget / 1000).toFixed(0)}K
              </p>
              <div className="w-full bg-muted rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full transition-all ${
                    budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Spent/Earned Ratio Card - Mobile */}
        <Card className="p-2 bg-card/95 backdrop-blur-sm border-border/50 shadow-md">
          <div className="text-center space-y-1">
            <div className="flex justify-center">
              <div className={`p-1 rounded-full ${
                spentToEarnedRatio > 100 ? 'bg-red-100 dark:bg-red-900/30' : 
                spentToEarnedRatio > 80 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'
              }`}>
                <TrendingUp className={`h-3 w-3 ${
                  spentToEarnedRatio > 100 ? 'text-red-600 dark:text-red-400' : 
                  spentToEarnedRatio > 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Spent/Earned</p>
              <p className={`text-sm font-bold ${
                spentToEarnedRatio > 100 ? 'text-red-600 dark:text-red-400' : 
                spentToEarnedRatio > 80 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {spentToEarnedRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Desktop layout remains the same
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Income Card */}
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Income</p>
            <p className="text-3xl font-bold text-green-600">₹{totalIncome.toFixed(2)}</p>
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
            <p className="text-3xl font-bold text-blue-600">₹{remainingBudget.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Used: {budgetUsed.toFixed(1)}%</span>
            <span>₹{budget.toFixed(2)} total</span>
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
