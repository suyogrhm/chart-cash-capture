
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/types/Transaction';
import { CircularSpendingChartProps } from '@/types/ChartTypes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useChartConfig } from '@/hooks/useChartConfig';
import { useChartData } from '@/hooks/useChartData';
import { ChartTooltip } from '@/components/chart/ChartTooltip';
import { ChartLegend } from '@/components/chart/ChartLegend';
import { ChartCenterText } from '@/components/chart/ChartCenterText';

export const CircularSpendingChart = ({ 
  data, 
  transactions, 
  title = "Spending by Category" 
}: CircularSpendingChartProps) => {
  const isMobile = useIsMobile();
  const chartConfig = useChartConfig();
  const chartData = useChartData(data, transactions);

  // Calculate total spending for center display
  const totalSpending = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0);
  }, [chartData]);

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-card border-chart-border">
        <CardHeader>
          <CardTitle className="text-chart-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No spending data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-chart-border">
      <CardHeader>
        <CardTitle className="text-chart-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ height: `${chartConfig.height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={chartConfig.outerRadius}
                innerRadius={chartConfig.innerRadius}
                strokeWidth={2}
                stroke="hsl(var(--border))"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend content={<ChartLegend />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center text positioned to match the chart center */}
          <div 
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            <div className="text-center">
              <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-foreground leading-tight whitespace-nowrap`}>
                ₹{totalSpending.toLocaleString()}
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 whitespace-nowrap`}>
                Spent in {new Date().toLocaleDateString('en-US', { month: 'long' })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
