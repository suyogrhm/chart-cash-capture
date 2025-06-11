
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

  // Debug safe area values and potential z-index conflicts
  useEffect(() => {
    if (isMobile) {
      console.log('=== MOBILE LAYOUT DEBUG ===');
      const computedStyle = getComputedStyle(document.documentElement);
      console.log('Safe area top:', computedStyle.getPropertyValue('--safe-area-inset-top'));
      console.log('Safe area bottom:', computedStyle.getPropertyValue('--safe-area-inset-bottom'));
      console.log('Safe area left:', computedStyle.getPropertyValue('--safe-area-inset-left'));
      console.log('Safe area right:', computedStyle.getPropertyValue('--safe-area-inset-right'));
      
      // Check viewport and screen dimensions
      console.log('Viewport dimensions:', {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        screenHeight: window.screen.height,
        availHeight: window.screen.availHeight
      });
      
      // Check for z-index stacking issues
      const checkZIndexIssues = () => {
        const header = document.querySelector('.mobile-fixed-header');
        if (header) {
          const headerStyle = getComputedStyle(header);
          console.log('Header z-index analysis:', {
            zIndex: headerStyle.zIndex,
            position: headerStyle.position,
            top: headerStyle.top,
            height: headerStyle.height,
            backgroundColor: headerStyle.backgroundColor,
            borderBottom: headerStyle.borderBottom
          });
          
          // Check if header is positioned correctly relative to status bar
          const headerRect = header.getBoundingClientRect();
          console.log('Header position rect:', {
            top: headerRect.top,
            height: headerRect.height,
            bottom: headerRect.bottom
          });
          
          // Check if header overlaps with potential status bar area
          if (headerRect.top <= 0) {
            console.warn('⚠️ Header may be overlapping with status bar area!');
          }
        }
        
        // Check all fixed/absolute positioned elements
        const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
          const style = getComputedStyle(el);
          return style.position === 'fixed' || style.position === 'absolute';
        });
        
        console.log('All fixed/absolute positioned elements:', fixedElements.map(el => ({
          tagName: el.tagName,
          className: el.className,
          position: getComputedStyle(el).position,
          zIndex: getComputedStyle(el).zIndex,
          top: getComputedStyle(el).top,
          backgroundColor: getComputedStyle(el).backgroundColor
        })));
      };
      
      // Run immediately and after a delay to catch dynamic changes
      checkZIndexIssues();
      setTimeout(checkZIndexIssues, 1000);
      
      const content = document.querySelector('.mobile-content-with-fixed-header');
      if (content) {
        const contentStyle = getComputedStyle(content);
        console.log('Content padding-top:', contentStyle.paddingTop);
      }
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

      {/* Mobile: Fixed Header - REDUCED Z-INDEX TO TEST */}
      {isMobile && (
        <div className="mobile-fixed-header" style={{ zIndex: 40 }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ExpenseTrackerLogo className="h-10 w-10" />
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Expense Tracker Pro
                </h1>
                <p className="text-muted-foreground text-xs">
                  Track your finances on the go
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      )}

      {/* Content Container with proper spacing for fixed header */}
      <div className={`container mx-auto ${isMobile ? 'px-2 py-4 pb-20 mobile-content-with-fixed-header' : 'px-4 py-6'} max-w-7xl`}>
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
