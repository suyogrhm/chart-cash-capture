
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Transaction } from '@/types/Transaction';
import { TrendingUp } from 'lucide-react';

interface CircularSpendingChartProps {
  transactions: Transaction[];
}

export const CircularSpendingChart = ({ transactions }: CircularSpendingChartProps) => {
  // Group expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const category = transaction.category;
      acc[category] = (acc[category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  // Convert to chart data format
  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    fill: `hsl(${Math.random() * 360}, 70%, 60%)` // Generate random colors
  }));

  // Predefined colors for better consistency
  const colors = [
    '#EF4444', // red
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#EC4899', // pink
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#84CC16', // lime
  ];

  // Apply predefined colors
  const dataWithColors = chartData.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }));

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

  const chartConfig = {
    amount: {
      label: "Amount",
    },
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Expenses by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {dataWithColors.length > 0 ? (
          <div className="space-y-4">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[300px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={dataWithColors}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={120}
                  strokeWidth={2}
                >
                  {dataWithColors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {dataWithColors.map((item, index) => (
                <div key={item.category} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="truncate">{item.category}</span>
                  <span className="ml-auto font-medium">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-2 border-t">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No expense data available</p>
            <p className="text-sm">Add some expenses to see the breakdown</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
