import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useLocation } from 'react-router-dom';

export const useBackButton = () => {
  const location = useLocation();
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    // Disabled to prevent crashes - keeping hook structure for future use
    console.log('Back button hook disabled to prevent crashes');
    
    // Always run the effect, but return early if not on native platform
    // if (!Capacitor.isNativePlatform()) {
    //   return;
    // }

    // let isMounted = true;

    // const setupBackButtonHandler = async () => {
    //   try {
    //     const { App } = await import('@capacitor/app');
        
    //     if (!isMounted) return;
        
    //     listenerRef.current = await App.addListener('backButton', ({ canGoBack }) => {
    //       if (canGoBack) {
    //         window.history.back();
    //       } else {
    //         App.exitApp();
    //       }
    //     });

    //   } catch (error) {
    //     console.warn('Back button setup failed:', error);
    //   }
    // };

    // setupBackButtonHandler();

    // return () => {
    //   isMounted = false;
    //   if (listenerRef.current) {
    //     listenerRef.current.remove();
    //   }
    // };
  }, [location.pathname]); // Stable dependency
};
