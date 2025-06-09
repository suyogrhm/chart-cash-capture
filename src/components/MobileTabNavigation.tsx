
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Tag, 
  Wallet 
} from 'lucide-react';

interface MobileTabNavigationProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const MobileTabNavigation = ({ value, onValueChange }: MobileTabNavigationProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="budgets">Budgets</TabsTrigger>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="accounts">Accounts</TabsTrigger>
      </TabsList>
    );
  }

  return (
    <TabsList className="grid w-full grid-cols-5 h-14 bg-card border-t border-border fixed bottom-0 left-0 right-0 z-50 rounded-none">
      <TabsTrigger value="dashboard" className="flex flex-col gap-1 p-2 text-xs">
        <LayoutDashboard className="h-5 w-5" />
        <span>Home</span>
      </TabsTrigger>
      <TabsTrigger value="transactions" className="flex flex-col gap-1 p-2 text-xs">
        <Receipt className="h-5 w-5" />
        <span>History</span>
      </TabsTrigger>
      <TabsTrigger value="budgets" className="flex flex-col gap-1 p-2 text-xs">
        <Target className="h-5 w-5" />
        <span>Budget</span>
      </TabsTrigger>
      <TabsTrigger value="categories" className="flex flex-col gap-1 p-2 text-xs">
        <Tag className="h-5 w-5" />
        <span>Tags</span>
      </TabsTrigger>
      <TabsTrigger value="accounts" className="flex flex-col gap-1 p-2 text-xs">
        <Wallet className="h-5 w-5" />
        <span>Accounts</span>
      </TabsTrigger>
    </TabsList>
  );
};
