
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserMenu } from '@/components/UserMenu';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className={`container mx-auto ${isMobile ? 'px-2 py-4' : 'px-4 py-8'} max-w-7xl`}>
        {/* Header */}
        <div className={`${isMobile ? 'mb-4' : 'mb-8'} flex justify-between items-center`}>
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-foreground mb-2`}>
              Expense Tracker Pro
            </h1>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {isMobile ? 'Track your finances on the go' : 'Advanced financial tracking with natural language processing'}
            </p>
          </div>
          <UserMenu />
        </div>
        {children}
      </div>
    </div>
  );
};
