
import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Expense Tracker Pro
          </h1>
          <p className="text-muted-foreground text-lg">
            Advanced financial tracking with natural language processing
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};
