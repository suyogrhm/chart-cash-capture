
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserMenu } from '@/components/UserMenu';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-background">
      {/* Desktop: Sticky Header with Navigation */}
      {!isMobile && (
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 py-3 max-w-7xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-8">
                <h1 className="text-xl font-bold text-foreground">
                  Expense Tracker Pro
                </h1>
                
                {/* Desktop Navigation Tabs */}
                <Tabs value={currentTab} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-5">
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

      {/* Content Container */}
      <div className={`container mx-auto ${isMobile ? 'px-2 py-4 pb-20' : 'px-4 py-6'} max-w-7xl`}>
        {/* Mobile: Header without Navigation (handled by MobileTabNavigation) */}
        {isMobile && (
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Expense Tracker Pro
              </h1>
              <p className="text-muted-foreground text-sm">
                Track your finances on the go
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
