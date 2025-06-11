import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '@/components/ThemeProvider';

export const useStatusBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Disabled to prevent crashes - keeping hook structure for future use
    console.log('Status bar hook disabled to prevent crashes');
    
    // Always run the effect, but return early if not on native platform
    // if (!Capacitor.isNativePlatform()) {
    //   return;
    // }

    // let isMounted = true;

    // const configureStatusBar = async () => {
    //   try {
    //     const { StatusBar, Style } = await import('@capacitor/status-bar');
        
    //     if (!isMounted) return;
        
    //     // Determine actual theme
    //     let actualTheme = theme;
    //     if (theme === 'system') {
    //       const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    //       actualTheme = systemPrefersDark ? 'dark' : 'light';
    //     }

    //     // Configure status bar
    //     if (actualTheme === 'light') {
    //       await StatusBar.setStyle({ style: Style.Dark });
    //       await StatusBar.setBackgroundColor({ color: '#ffffff' });
    //     } else {
    //       await StatusBar.setStyle({ style: Style.Light });
    //       await StatusBar.setBackgroundColor({ color: '#020817' });
    //     }

    //     await StatusBar.show();

    //   } catch (error) {
    //     console.warn('Status bar configuration failed:', error);
    //   }
    // };

    // configureStatusBar();

    // return () => {
    //   isMounted = false;
    // };
  }, [theme]); // Stable dependency
};
