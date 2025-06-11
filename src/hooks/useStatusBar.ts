
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
      console.log('STATUS BAR: Not on native platform, skipping configuration');
      return;
    }

    const setStatusBarStyle = async () => {
      try {
        console.log(`STATUS BAR: Starting configuration. Theme: ${theme}`);
        
        // Dynamically import StatusBar to avoid module resolution issues
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        console.log('STATUS BAR: StatusBar module imported successfully');
        
        // Determine the actual theme being applied
        let actualTheme = theme;
        if (theme === 'system') {
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          actualTheme = systemPrefersDark ? 'dark' : 'light';
        }
        
        console.log(`STATUS BAR: Using theme: ${actualTheme}`);

        // CRITICAL: First disable overlay mode completely
        await StatusBar.setOverlaysWebView({ overlay: false });
        console.log('STATUS BAR: Overlay disabled');

        // For light theme: dark icons on light background
        // For dark theme: light icons on dark background  
        if (actualTheme === 'light') {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          console.log('STATUS BAR: Applied light theme - dark icons, white background');
        } else {
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#020817' });
          console.log('STATUS BAR: Applied dark theme - light icons, dark background');
        }

        // Force show the status bar
        await StatusBar.show();
        console.log('STATUS BAR: Status bar shown');

        // Verify the final configuration
        const info = await StatusBar.getInfo();
        console.log(`STATUS BAR: Final status - Visible: ${info.visible}, Style: ${info.style}, Overlay: ${info.overlays}`);

      } catch (error) {
        console.error(`STATUS BAR: ERROR - ${error.message || error}`);
        console.error("STATUS BAR: Full error details:", error);
      }
    };

    // Execute immediately, no delay
    setStatusBarStyle();
  }, [theme]); // This effect re-runs whenever the app theme changes
};
