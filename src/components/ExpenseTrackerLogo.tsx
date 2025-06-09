
import React from 'react';
import { cn } from '@/lib/utils';

interface ExpenseTrackerLogoProps {
  className?: string;
}

export const ExpenseTrackerLogo = ({ className }: ExpenseTrackerLogoProps) => {
  return (
    <div className={cn("relative", className)}>
      <svg 
        viewBox="0 0 32 32" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle 
          cx="16" 
          cy="16" 
          r="15" 
          fill="hsl(var(--primary))"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
        
        {/* Chart lines */}
        <path 
          d="M8 20 L12 16 L16 18 L24 10" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Data points */}
        <circle cx="8" cy="20" r="2" fill="white" />
        <circle cx="12" cy="16" r="2" fill="white" />
        <circle cx="16" cy="18" r="2" fill="white" />
        <circle cx="24" cy="10" r="2" fill="white" />
        
        {/* Dollar sign overlay */}
        <text 
          x="16" 
          y="26" 
          textAnchor="middle" 
          fontSize="8" 
          fill="white" 
          fontWeight="bold"
        >
          $
        </text>
      </svg>
    </div>
  );
};
