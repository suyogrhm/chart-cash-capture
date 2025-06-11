
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
      console.log('Not on native platform, skipping status bar configuration');
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
        
        // For light theme: dark icons on light background
        // For dark theme: light icons on dark background
        const currentStyle = actualTheme === 'light' ? Style.Dark : Style.Light;
        
        // Use CSS custom property colors that match our theme
        const backgroundColor = actualTheme === 'light' ? '#ffffff' : '#020817';

        console.log(`Status bar update - Theme: ${actualTheme}, Style: ${currentStyle === Style.Light ? 'Light icons' : 'Dark icons'}, Background: ${backgroundColor}`);

        // Set overlay to false to ensure proper spacing
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        // Set the style (icon color)
        await StatusBar.setStyle({ style: currentStyle });
        
        // Set the background color
        await StatusBar.setBackgroundColor({ color: backgroundColor });

        console.log('Status bar configuration applied successfully');

      } catch (error) {
        console.error("Failed to set status bar style:", error);
        // Gracefully handle the error - app should still work without status bar changes
      }
    };

    // Use a longer delay to ensure theme changes are fully applied
    const timeoutId = setTimeout(setStatusBarStyle, 200);
    
    return () => clearTimeout(timeoutId);
  }, [theme]); // This effect re-runs whenever the app theme changes
};
