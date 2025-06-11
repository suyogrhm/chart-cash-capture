
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '@/components/ThemeProvider';

/**
 * A custom hook to dynamically update the status bar style based on the app's theme.
 */
export const useStatusBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    console.log(`=== STATUS BAR DEBUG START ===`);
    console.log(`Current theme from useTheme: ${theme}`);
    console.log(`Is native platform: ${Capacitor.isNativePlatform()}`);
    console.log(`Platform: ${Capacitor.getPlatform()}`);
    
    // Only run this logic on a native mobile device
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping status bar configuration');
      console.log(`=== STATUS BAR DEBUG END ===`);
      return;
    }

    const setStatusBarStyle = async () => {
      try {
        console.log('Starting status bar configuration...');
        
        // Dynamically import StatusBar to avoid module resolution issues
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        console.log('StatusBar module imported successfully');
        
        // Check current status bar info
        try {
          const currentInfo = await StatusBar.getInfo();
          console.log('Current status bar info:', currentInfo);
        } catch (infoError) {
          console.log('Could not get current status bar info:', infoError);
        }
        
        // Determine the actual theme being applied
        let actualTheme = theme;
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          actualTheme = systemPrefersDark ? 'dark' : 'light';
          console.log(`System theme detected: ${actualTheme} (prefers-dark: ${systemPrefersDark})`);
        }
        
        // Check what theme class is actually applied to the document
        const documentClasses = document.documentElement.classList;
        console.log('Document classes:', Array.from(documentClasses));
        
        // For light theme: dark icons on light background
        // For dark theme: light icons on dark background
        const currentStyle = actualTheme === 'light' ? Style.Dark : Style.Light;
        
        // Use CSS custom property colors that match our theme
        const backgroundColor = actualTheme === 'light' ? '#ffffff' : '#020817';

        console.log(`Configuration:`);
        console.log(`- Theme: ${actualTheme}`);
        console.log(`- Style: ${currentStyle === Style.Light ? 'Light icons' : 'Dark icons'}`);
        console.log(`- Background: ${backgroundColor}`);
        console.log(`- Style enum value: ${currentStyle}`);

        // Set overlay to false to ensure proper spacing
        console.log('Setting overlay to false...');
        await StatusBar.setOverlaysWebView({ overlay: false });
        console.log('Overlay set successfully');
        
        // Set the style (icon color)
        console.log('Setting status bar style...');
        await StatusBar.setStyle({ style: currentStyle });
        console.log('Status bar style set successfully');
        
        // Set the background color
        console.log('Setting background color...');
        await StatusBar.setBackgroundColor({ color: backgroundColor });
        console.log('Background color set successfully');

        // Verify the changes
        try {
          const newInfo = await StatusBar.getInfo();
          console.log('New status bar info after changes:', newInfo);
        } catch (verifyError) {
          console.log('Could not verify status bar changes:', verifyError);
        }

        console.log('Status bar configuration applied successfully');

      } catch (error) {
        console.error("Failed to set status bar style:", error);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        // Gracefully handle the error - app should still work without status bar changes
      }
    };

    // Use a longer delay to ensure theme changes are fully applied
    console.log('Setting timeout for status bar configuration...');
    const timeoutId = setTimeout(() => {
      console.log('Timeout triggered, executing status bar configuration');
      setStatusBarStyle();
    }, 200);
    
    return () => {
      console.log('Cleaning up status bar timeout');
      clearTimeout(timeoutId);
      console.log(`=== STATUS BAR DEBUG END ===`);
    };
  }, [theme]); // This effect re-runs whenever the app theme changes
};
