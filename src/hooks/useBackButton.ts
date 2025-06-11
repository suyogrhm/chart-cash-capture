
import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useLocation } from 'react-router-dom';

export const useBackButton = () => {
  const location = useLocation();
  const listenerRef = useRef<(() => void) | null>(null);
  
  // Always calculate this, never conditionally
  const isDashboard = location.pathname === '/' && !location.search.includes('tab=');

  useEffect(() => {
    // Always run the effect, but return early if not on native platform
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;

    const setupBackButton = async () => {
      try {
        const appModule = await import('@capacitor/app');
        
        if (!appModule || !isMounted) return;
        
        const { App } = appModule;
        
        // Remove existing listener if any
        if (listenerRef.current) {
          listenerRef.current();
          listenerRef.current = null;
        }
        
        const listener = await App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack || isDashboard) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
        
        listenerRef.current = () => listener.remove();

      } catch (error) {
        console.warn('Back button setup failed:', error);
      }
    };

    setupBackButton();

    return () => {
      isMounted = false;
      if (listenerRef.current) {
        listenerRef.current();
        listenerRef.current = null;
      }
    };
  }, [isDashboard]); // Dependencies are stable
};
