
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useLocation } from 'react-router-dom';

export const useBackButton = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/' && !location.search.includes('tab=');
  const listenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;

    const handleBackButton = async () => {
      try {
        const appModule = await import('@capacitor/app').catch(() => null);
        
        if (!appModule || !isMounted) return;
        
        const { App } = appModule;
        
        // Remove existing listener if any
        if (listenerRef.current) {
          listenerRef.current();
          listenerRef.current = null;
        }
        
        const listener = App.addListener('backButton', ({ canGoBack }) => {
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
        
        listenerRef.current = () => listener.remove();

      } catch (error) {
        console.warn('Back button setup failed:', error);
      }
    };

    handleBackButton();

    return () => {
      isMounted = false;
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [isDashboard]);
};
