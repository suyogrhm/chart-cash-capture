
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useStatusBar = () => {
  useEffect(() => {
    const initializeStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const statusBarModule = await import('@capacitor/status-bar').catch(() => null);
          
          if (statusBarModule) {
            const { StatusBar, Style } = statusBarModule;
            
            // Check if system is in dark mode
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const currentTheme = localStorage.getItem('vite-ui-theme');
            const isDarkMode = currentTheme === 'dark' || (currentTheme === 'system' && prefersDark);
            
            // Set appropriate status bar style and background based on theme
            if (isDarkMode) {
              await StatusBar.setStyle({ style: Style.Light }); // White icons for dark mode
              await StatusBar.setBackgroundColor({ color: '#0f0f23' }); // Dark background matching app
            } else {
              await StatusBar.setStyle({ style: Style.Dark }); // Dark icons for light mode
              await StatusBar.setBackgroundColor({ color: '#ffffff' }); // Light background matching app
            }
            
            // Status bar should not overlay the webview to prevent content overlap
            await StatusBar.setOverlaysWebView({ overlay: false });
            
            // Listen for theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleThemeChange = async () => {
              const newPrefersDark = mediaQuery.matches;
              const newCurrentTheme = localStorage.getItem('vite-ui-theme');
              const newIsDarkMode = newCurrentTheme === 'dark' || (newCurrentTheme === 'system' && newPrefersDark);
              
              if (newIsDarkMode) {
                await StatusBar.setStyle({ style: Style.Light }); // White icons for dark mode
                await StatusBar.setBackgroundColor({ color: '#0f0f23' }); // Dark background
              } else {
                await StatusBar.setStyle({ style: Style.Dark }); // Dark icons for light mode
                await StatusBar.setBackgroundColor({ color: '#ffffff' }); // Light background
              }
            };
            
            mediaQuery.addEventListener('change', handleThemeChange);
            
            // Also listen for storage changes (theme toggle)
            window.addEventListener('storage', handleThemeChange);
            
            return () => {
              mediaQuery.removeEventListener('change', handleThemeChange);
              window.removeEventListener('storage', handleThemeChange);
            };
          } else {
            console.log('StatusBar plugin not available - this is normal for web builds');
          }
        } catch (error) {
          console.log('StatusBar plugin not available:', error);
        }
      }
    };

    initializeStatusBar();
  }, []);
};
