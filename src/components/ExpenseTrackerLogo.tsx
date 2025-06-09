
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
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
          </linearGradient>
        </defs>
        
        <circle 
          cx="16" 
          cy="16" 
          r="15" 
          fill="url(#logoGradient)"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />
        
        {/* Dollar sign - main symbol */}
        <path 
          d="M14 8 L14 6 M18 8 L18 6 M14 26 L14 24 M18 26 L18 24"
          stroke="hsl(var(--primary-foreground))" 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        
        {/* Dollar sign body */}
        <path 
          d="M12 12 C12 10.5 13 9 16 9 C19 9 20 10.5 20 12 C20 13.5 19 14.5 16 14.5 C13 14.5 12 15.5 12 17 C12 18.5 13 20 16 20 C19 20 20 18.5 20 17"
          stroke="hsl(var(--primary-foreground))" 
          strokeWidth="2" 
          strokeLinecap="round" 
          fill="none"
        />
        
        {/* Trend arrow going up (representing growth/tracking) */}
        <path 
          d="M6 20 L10 16 L14 18 L26 8"
          stroke="hsl(var(--primary-foreground))" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
        
        {/* Arrow head */}
        <path 
          d="M23 8 L26 8 L26 11"
          stroke="hsl(var(--primary-foreground))" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />
        
        {/* Small data points */}
        <circle cx="10" cy="16" r="1" fill="hsl(var(--primary-foreground))" opacity="0.8" />
        <circle cx="14" cy="18" r="1" fill="hsl(var(--primary-foreground))" opacity="0.8" />
      </svg>
    </div>
  );
};
