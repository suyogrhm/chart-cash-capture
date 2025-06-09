
import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-foreground font-medium">{data.name}</p>
        <p className="text-primary">
          Amount: ₹{Number(data.value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};
