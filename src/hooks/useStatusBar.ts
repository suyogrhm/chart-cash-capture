
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

    const setStatusBarStyle = async () => {
      try {
        // Dynamically import StatusBar to avoid module resolution issues
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        
        // Determine the actual theme being applied
        let actualTheme = theme;
        if (theme === 'system') {
          // Check system preference when theme is set to 'system'
          actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        // For a 'light' theme, we want dark icons (Style.Dark).
        // For a 'dark' theme, we want light icons (Style.Light).
        const currentStyle = actualTheme === 'light' ? Style.Dark : Style.Light;
        
        // Set the background color to match the theme.
        const backgroundColor = actualTheme === 'light' ? '#ffffff' : '#020817';

        console.log(`Setting status bar for ${actualTheme} theme: ${currentStyle === Style.Light ? 'Light icons' : 'Dark icons'}`);

        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: currentStyle });
        await StatusBar.setBackgroundColor({ color: backgroundColor });

      } catch (error) {
        console.error("Failed to set status bar style", error);
        // Gracefully handle the error - app should still work without status bar changes
      }
    };

    // Add a small delay to ensure the theme is fully applied
    const timeoutId = setTimeout(setStatusBarStyle, 100);
    
    return () => clearTimeout(timeoutId);
  }, [theme]); // This effect re-runs whenever the app theme changes
};
