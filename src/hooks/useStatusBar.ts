
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
    
    // Check if any elements are covering the status bar area
    const checkStatusBarCoverage = () => {
      const elementsAtTop = document.elementsFromPoint(window.innerWidth / 2, 10);
      console.log('Elements at top of screen (y=10):', elementsAtTop.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        zIndex: getComputedStyle(el).zIndex,
        position: getComputedStyle(el).position,
        top: getComputedStyle(el).top,
        backgroundColor: getComputedStyle(el).backgroundColor
      })));
      
      // Check if fixed header exists and its styling
      const fixedHeader = document.querySelector('.mobile-fixed-header');
      if (fixedHeader) {
        const headerStyle = getComputedStyle(fixedHeader);
        console.log('Fixed header styling:', {
          zIndex: headerStyle.zIndex,
          position: headerStyle.position,
          top: headerStyle.top,
          backgroundColor: headerStyle.backgroundColor,
          height: headerStyle.height,
          paddingTop: headerStyle.paddingTop
        });
      }
    };
    
    // Only run this logic on a native mobile device
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping status bar configuration');
      checkStatusBarCoverage();
      console.log(`=== STATUS BAR DEBUG END ===`);
      return;
    }

    const setStatusBarStyle = async () => {
      try {
        console.log('Starting status bar configuration...');
        
        // Dynamically import StatusBar to avoid module resolution issues
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        console.log('StatusBar module imported successfully');
        
        // Check current status bar info BEFORE changes
        try {
          const currentInfo = await StatusBar.getInfo();
          console.log('BEFORE - Current status bar info:', currentInfo);
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
        const documentHasDark = documentClasses.contains('dark');
        const documentHasLight = documentClasses.contains('light');
        console.log('Document classes:', Array.from(documentClasses));
        console.log(`Document theme state: dark=${documentHasDark}, light=${documentHasLight}`);
        
        // For light theme: dark icons on light background
        // For dark theme: light icons on dark background
        const currentStyle = actualTheme === 'light' ? Style.Dark : Style.Light;
        
        // Use CSS custom property colors that match our theme
        const backgroundColor = actualTheme === 'light' ? '#ffffff' : '#020817';

        console.log(`Configuration to apply:`);
        console.log(`- Theme: ${actualTheme}`);
        console.log(`- Style: ${currentStyle === Style.Light ? 'Light icons' : 'Dark icons'}`);
        console.log(`- Background: ${backgroundColor}`);
        console.log(`- Style enum value: ${currentStyle}`);

        // CRITICAL: Set overlay to false FIRST to ensure proper native handling
        console.log('Setting overlay to false...');
        await StatusBar.setOverlaysWebView({ overlay: false });
        console.log('Overlay set to false successfully');
        
        // Wait a bit for the overlay setting to take effect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Set the background color BEFORE style to avoid flickers
        console.log('Setting background color...');
        await StatusBar.setBackgroundColor({ color: backgroundColor });
        console.log('Background color set successfully');
        
        // Set the style (icon color) LAST
        console.log('Setting status bar style...');
        await StatusBar.setStyle({ style: currentStyle });
        console.log('Status bar style set successfully');

        // Wait and verify the changes
        await new Promise(resolve => setTimeout(resolve, 200));
        try {
          const newInfo = await StatusBar.getInfo();
          console.log('AFTER - New status bar info after changes:', newInfo);
        } catch (verifyError) {
          console.log('Could not verify status bar changes:', verifyError);
        }

        // Check if our app elements are interfering
        checkStatusBarCoverage();

        console.log('Status bar configuration applied successfully');

      } catch (error) {
        console.error("Failed to set status bar style:", error);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    };

    // Use a longer delay to ensure DOM is ready and theme is applied
    console.log('Setting timeout for status bar configuration...');
    const timeoutId = setTimeout(() => {
      console.log('Timeout triggered, executing status bar configuration');
      setStatusBarStyle();
    }, 500); // Increased delay
    
    return () => {
      console.log('Cleaning up status bar timeout');
      clearTimeout(timeoutId);
      console.log(`=== STATUS BAR DEBUG END ===`);
    };
  }, [theme]); // This effect re-runs whenever the app theme changes
};
