
import React from 'react';

interface ChartCenterTextProps {
  totalSpending: number;
  isMobile: boolean;
}

export const ChartCenterText = ({ totalSpending, isMobile }: ChartCenterTextProps) => {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        width: 'fit-content',
        height: 'fit-content'
      }}
    >
      <div className="text-center flex flex-col items-center justify-center">
        <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-foreground leading-tight whitespace-nowrap`}>
          ₹{totalSpending.toLocaleString()}
        </p>
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1 whitespace-nowrap`}>
          Spent in {currentMonth}
        </p>
      </div>
    </div>
  );
};
