
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
            
            const applyStatusBarTheme = async () => {
              // Check if system is in dark mode
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const currentTheme = localStorage.getItem('vite-ui-theme');
              const isDarkMode = currentTheme === 'dark' || (currentTheme === 'system' && prefersDark);
              
              console.log('Applying status bar theme - isDarkMode:', isDarkMode);
              console.log('Current theme setting:', currentTheme);
              console.log('System prefers dark:', prefersDark);
              
              // Force status bar to not overlay the webview first
              await StatusBar.setOverlaysWebView({ overlay: false });
              
              // Set appropriate status bar style and background based on theme
              if (isDarkMode) {
                // For dark mode: CRITICAL - Force light content (white icons) with dark background
                console.log('Setting LIGHT style for dark mode (white icons)');
                await StatusBar.setStyle({ style: Style.Light });
                // Use pure black for maximum contrast
                await StatusBar.setBackgroundColor({ color: '#000000' });
                console.log('Applied dark mode status bar settings - white icons on black background');
              } else {
                // For light mode: Dark content (dark icons) with light background
                console.log('Setting DARK style for light mode (dark icons)');
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#ffffff' });
                console.log('Applied light mode status bar settings - dark icons on white background');
              }
            };
            
            // Apply initial theme
            await applyStatusBarTheme();
            
            // Listen for system theme changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleSystemThemeChange = async () => {
              console.log('System theme changed, reapplying status bar theme');
              await applyStatusBarTheme();
            };
            
            // Listen for manual theme changes (from theme toggle)
            const handleManualThemeChange = async () => {
              console.log('Manual theme change detected, reapplying status bar theme');
              // Add a small delay to ensure localStorage is updated
              setTimeout(async () => {
                await applyStatusBarTheme();
              }, 100);
            };
            
            // Listen for theme changes from the DOM (when class changes)
            const observer = new MutationObserver(async (mutations) => {
              for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                  const target = mutation.target as HTMLElement;
                  if (target === document.documentElement) {
                    console.log('DOM class changed, reapplying status bar theme');
                    await applyStatusBarTheme();
                    break;
                  }
                }
              }
            });
            
            // Start observing the document element for class changes
            observer.observe(document.documentElement, {
              attributes: true,
              attributeFilter: ['class']
            });
            
            mediaQuery.addEventListener('change', handleSystemThemeChange);
            window.addEventListener('storage', handleManualThemeChange);
            
            return () => {
              mediaQuery.removeEventListener('change', handleSystemThemeChange);
              window.removeEventListener('storage', handleManualThemeChange);
              observer.disconnect();
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
