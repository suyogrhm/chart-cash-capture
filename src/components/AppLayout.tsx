
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';
import { MobileTabNavigation } from '@/components/MobileTabNavigation';
import { ExpenseTrackerLogo } from '@/components/ExpenseTrackerLogo';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current tab from URL
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'dashboard';

  const handleTabChange = (tab: string) => {
    navigate(`/?tab=${tab}`);
  };

  return (
    <div className="mobile-min-vh bg-background">
      {/* Desktop: Sticky Header with Navigation */}
      {!isMobile && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 py-3 max-w-7xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ExpenseTrackerLogo className="h-8 w-8" />
                <h1 className="text-xl font-bold text-foreground">
                  Expense Tracker Pro
                </h1>
              </div>
              
              {/* Centered Desktop Navigation Tabs */}
              <div className="flex-1 flex justify-center">
                <Tabs value={currentTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-auto grid-cols-5">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="budgets">Budgets</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile: Fixed Header */}
      {isMobile && (
        <div className="mobile-fixed-header">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ExpenseTrackerLogo className="h-6 w-6" />
              <h1 className="text-lg font-bold text-foreground">
                Expense Tracker Pro
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      )}

      {/* Content Container */}
      <div className={`container mx-auto ${isMobile ? 'mobile-content-with-fixed-header px-2 py-4 pb-20' : 'px-4 py-6'} max-w-7xl`}>
        {children}
      </div>

      {/* Mobile: Bottom Navigation */}
      {isMobile && (
        <div className="safe-bottom">
          <MobileTabNavigation value={currentTab} onValueChange={handleTabChange} />
        </div>
      )}
    </div>
  );
};
