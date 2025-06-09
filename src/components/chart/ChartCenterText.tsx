
import React from 'react';

interface ChartCenterTextProps {
  totalSpending: number;
  isMobile: boolean;
}

export const ChartCenterText = ({ totalSpending, isMobile }: ChartCenterTextProps) => {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div 
      className="absolute pointer-events-none flex items-center justify-center"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10
      }}
    >
      <div className="text-center">
        <p className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-foreground leading-tight whitespace-nowrap`}>
          ₹{totalSpending.toLocaleString()}
        </p>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 whitespace-nowrap`}>
          Spent in {currentMonth}
        </p>
      </div>
    </div>
  );
};
