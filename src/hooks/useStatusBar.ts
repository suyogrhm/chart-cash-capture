
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
            
            console.log('Status bar initialization - isDarkMode:', isDarkMode);
            
            // Set appropriate status bar style and background based on theme
            if (isDarkMode) {
              // Force white icons with light content style
              await StatusBar.setStyle({ style: Style.Light });
              // Try a slightly lighter dark background for better icon visibility
              await StatusBar.setBackgroundColor({ color: '#121212' });
              console.log('Applied dark mode status bar settings');
            } else {
              // Dark icons for light mode
              await StatusBar.setStyle({ style: Style.Dark });
              await StatusBar.setBackgroundColor({ color: '#ffffff' });
              console.log('Applied light mode status bar settings');
            }
            
            // Status bar should not overlay the webview to prevent content overlap
            await StatusBar.setOverlaysWebView({ overlay: false });
            
            // Listen for theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleThemeChange = async () => {
              const newPrefersDark = mediaQuery.matches;
              const newCurrentTheme = localStorage.getItem('vite-ui-theme');
              const newIsDarkMode = newCurrentTheme === 'dark' || (newCurrentTheme === 'system' && newPrefersDark);
              
              console.log('Theme changed - newIsDarkMode:', newIsDarkMode);
              
              if (newIsDarkMode) {
                await StatusBar.setStyle({ style: Style.Light });
                await StatusBar.setBackgroundColor({ color: '#121212' });
                console.log('Applied dark mode status bar on theme change');
              } else {
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#ffffff' });
                console.log('Applied light mode status bar on theme change');
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
