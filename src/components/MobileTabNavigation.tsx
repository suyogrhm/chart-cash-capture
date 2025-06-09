
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Tag, 
  Wallet 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTabNavigationProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const MobileTabNavigation = ({ value, onValueChange }: MobileTabNavigationProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  const tabs = [
    { value: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { value: 'transactions', label: 'History', icon: Receipt },
    { value: 'budgets', label: 'Budget', icon: Target },
    { value: 'categories', label: 'Tags', icon: Tag },
    { value: 'accounts', label: 'Accounts', icon: Wallet },
  ];

  return (
    <div className="grid grid-cols-5 h-14 bg-card border-t border-border fixed bottom-0 left-0 right-0 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = value === tab.value;
        
        return (
          <button
            key={tab.value}
            onClick={() => onValueChange(tab.value)}
            className={cn(
              "flex flex-col gap-1 p-2 text-xs items-center justify-center transition-colors",
              "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
