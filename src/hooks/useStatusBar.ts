
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
              // Check if dark mode is active by looking at the DOM class
              const isDarkMode = document.documentElement.classList.contains('dark');
              
              console.log('Applying status bar theme - isDarkMode:', isDarkMode);
              console.log('HTML classes:', document.documentElement.className);
              
              // Force status bar to not overlay the webview
              await StatusBar.setOverlaysWebView({ overlay: false });
              
              // Set appropriate status bar style and background based on theme
              if (isDarkMode) {
                // For dark mode: Force light content (white icons) with dark background
                console.log('Setting LIGHT style for dark mode (white icons)');
                await StatusBar.setStyle({ style: Style.Light });
                await StatusBar.setBackgroundColor({ color: '#000000' });
                console.log('Applied dark mode status bar - white icons on black background');
                
                // Retry setting the style to ensure it takes effect
                setTimeout(async () => {
                  await StatusBar.setStyle({ style: Style.Light });
                  console.log('Retried setting LIGHT style for dark mode');
                }, 100);
              } else {
                // For light mode: Dark content (dark icons) with light background
                console.log('Setting DARK style for light mode (dark icons)');
                await StatusBar.setStyle({ style: Style.Dark });
                await StatusBar.setBackgroundColor({ color: '#ffffff' });
                console.log('Applied light mode status bar - dark icons on white background');
                
                // Retry setting the style to ensure it takes effect
                setTimeout(async () => {
                  await StatusBar.setStyle({ style: Style.Dark });
                  console.log('Retried setting DARK style for light mode');
                }, 100);
              }
            };
            
            // Add delay to ensure theme is fully loaded before applying status bar
            setTimeout(async () => {
              await applyStatusBarTheme();
            }, 200);
            
            // Listen for DOM class changes (when theme changes)
            const observer = new MutationObserver(async (mutations) => {
              for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                  const target = mutation.target as HTMLElement;
                  if (target === document.documentElement) {
                    console.log('DOM class changed, reapplying status bar theme');
                    // Add small delay to ensure theme change is complete
                    setTimeout(async () => {
                      await applyStatusBarTheme();
                    }, 50);
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
            
            // Listen for system theme changes as backup
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleSystemThemeChange = async () => {
              console.log('System theme changed, reapplying status bar theme');
              setTimeout(async () => {
                await applyStatusBarTheme();
              }, 100);
            };
            
            mediaQuery.addEventListener('change', handleSystemThemeChange);
            
            return () => {
              observer.disconnect();
              mediaQuery.removeEventListener('change', handleSystemThemeChange);
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
