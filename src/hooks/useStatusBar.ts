
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '@/components/ThemeProvider';

/**
 * A custom hook to dynamically update the status bar style based on the app's theme.
 */
export const useStatusBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Only run this logic on a native mobile device
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let isMounted = true;

    const setStatusBarStyle = async () => {
      try {
        // Dynamically import StatusBar to avoid module resolution issues
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        // Determine the actual theme being applied
        let actualTheme = theme;
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          actualTheme = systemPrefersDark ? 'dark' : 'light';
        }

        // Apply status bar configuration based on theme
        if (actualTheme === 'light') {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        } else {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#020817' });
        }

        // Ensure status bar is visible
        await StatusBar.show();

      } catch (error) {
        // Silently handle errors to prevent crashes
        console.warn('Status bar configuration failed:', error);
      }
    };

    // Add a small delay to ensure proper initialization
    const timer = setTimeout(setStatusBarStyle, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [theme]);
};
