
import React from 'react';

interface ChartLegendProps {
  payload?: any[];
}

export const ChartLegend = ({ payload }: ChartLegendProps) => {
  if (!payload || payload.length === 0) return null;
  
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};
