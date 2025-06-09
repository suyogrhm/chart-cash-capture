
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpendingData {
  name: string;
  value: number;
  color: string;
}

interface CircularSpendingChartProps {
  data: SpendingData[];
  title?: string;
}

export const CircularSpendingChart = ({ data, title = "Spending by Category" }: CircularSpendingChartProps) => {
  return (
    <Card className="bg-card border-chart-border">
      <CardHeader>
        <CardTitle className="text-chart-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={70}
              strokeWidth={1}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--chart-bg))',
                border: '1px solid hsl(var(--chart-border))',
                borderRadius: '6px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
