
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useTheme } from '@/components/ThemeProvider';

/**
 * A custom hook to dynamically update the status bar style based on the app's theme.
 */
export const useStatusBar = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Use alert for debugging since console.log doesn't show in logcat reliably
    const debugAlert = (message: string) => {
      console.log(message);
      // Uncomment next line for debugging alerts
      // alert(message);
    };

    debugAlert(`STATUS BAR: Starting configuration. Theme: ${theme}, Platform: ${Capacitor.getPlatform()}, IsNative: ${Capacitor.isNativePlatform()}`);
    
    // Only run this logic on a native mobile device
    if (!Capacitor.isNativePlatform()) {
      debugAlert('STATUS BAR: Not on native platform, skipping configuration');
      return;
    }

    const setStatusBarStyle = async () => {
      try {
        debugAlert('STATUS BAR: Starting async configuration...');
        
        // Dynamically import StatusBar to avoid module resolution issues
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        debugAlert('STATUS BAR: StatusBar module imported successfully');
        
        // Determine the actual theme being applied
        let actualTheme = theme;
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          actualTheme = systemPrefersDark ? 'dark' : 'light';
          debugAlert(`STATUS BAR: System theme detected as ${actualTheme}`);
        }
        
        // Check document theme classes for verification
        const documentHasDark = document.documentElement.classList.contains('dark');
        debugAlert(`STATUS BAR: Document has dark class: ${documentHasDark}`);
        
        // For light theme: dark icons on light background
        // For dark theme: light icons on dark background  
        const statusBarStyle = actualTheme === 'light' ? Style.Dark : Style.Light;
        const backgroundColor = actualTheme === 'light' ? '#ffffff' : '#020817';

        debugAlert(`STATUS BAR: Will apply - Style: ${statusBarStyle === Style.Light ? 'Light icons' : 'Dark icons'}, Background: ${backgroundColor}`);

        // STEP 1: First set overlay to false - this is critical
        debugAlert('STATUS BAR: Setting overlay to false...');
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        // STEP 2: Set background color
        debugAlert('STATUS BAR: Setting background color...');
        await StatusBar.setBackgroundColor({ color: backgroundColor });
        
        // STEP 3: Set icon style
        debugAlert('STATUS BAR: Setting icon style...');
        await StatusBar.setStyle({ style: statusBarStyle });

        debugAlert('STATUS BAR: Configuration completed successfully');

        // Verify the result
        try {
          const info = await StatusBar.getInfo();
          debugAlert(`STATUS BAR: Final status - Visible: ${info.visible}, Style: ${info.style}, Overlay: ${info.overlays}`);
        } catch (verifyError) {
          debugAlert(`STATUS BAR: Could not verify final state: ${verifyError}`);
        }

      } catch (error) {
        debugAlert(`STATUS BAR: ERROR - ${error.message || error}`);
        console.error("STATUS BAR: Full error details:", error);
      }
    };

    // Add a longer delay to ensure DOM and theme are fully ready
    const timeoutId = setTimeout(() => {
      debugAlert('STATUS BAR: Timeout triggered, executing configuration');
      setStatusBarStyle();
    }, 1000); // Increased delay to 1 second
    
    return () => {
      clearTimeout(timeoutId);
      debugAlert('STATUS BAR: Cleanup completed');
    };
  }, [theme]); // This effect re-runs whenever the app theme changes
};
