
import React, { useEffect } from 'react';
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

  // Debug safe area values and z-index conflicts
  useEffect(() => {
    if (isMobile) {
      console.log('=== MOBILE LAYOUT DEBUG ===');
      const computedStyle = getComputedStyle(document.documentElement);
      console.log('Safe area top:', computedStyle.getPropertyValue('--safe-area-inset-top'));
      console.log('Safe area bottom:', computedStyle.getPropertyValue('--safe-area-inset-bottom'));
      
      // Check viewport dimensions
      console.log('Viewport dimensions:', {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        screenHeight: window.screen.height,
        availHeight: window.screen.availHeight
      });
      
      // TEMPORARY: Alert to check if this code runs on mobile
      alert(`Mobile layout loaded. Safe area top: ${computedStyle.getPropertyValue('--safe-area-inset-top')}`);
      console.log('=== MOBILE LAYOUT DEBUG END ===');
    }
  }, [isMobile]);

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

      {/* TEMPORARILY REMOVED MOBILE HEADER TO TEST STATUS BAR */}
      {/* We'll add it back once status bar works */}

      {/* Content Container - no fixed header spacing for now */}
      <div className={`container mx-auto ${isMobile ? 'px-2 py-4 pb-20' : 'px-4 py-6'} max-w-7xl`}>
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
