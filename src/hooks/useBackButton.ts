
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useLocation } from 'react-router-dom';

export const useBackButton = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/' && !location.search.includes('tab=');

  useEffect(() => {
    const handleBackButton = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const appModule = await import('@capacitor/app').catch(() => null);
          
          if (appModule) {
            const { App } = appModule;
            
            App.addListener('backButton', ({ canGoBack }) => {
              if (!canGoBack || isDashboard) {
                // Show exit confirmation dialog
                const confirmExit = confirm('Do you want to exit the app?');
                if (confirmExit) {
                  App.exitApp();
                }
              } else {
                window.history.back();
              }
            });
          }
        } catch (error) {
          console.log('App plugin not available:', error);
        }
      }
    };

    handleBackButton();

    return () => {
      if (Capacitor.isNativePlatform()) {
        import('@capacitor/app').then(({ App }) => {
          App.removeAllListeners();
        }).catch(() => {});
      }
    };
  }, [isDashboard]);
};
