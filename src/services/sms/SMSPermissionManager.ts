import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { SmsPlugin, SMSPermissionResult } from '@/types/SMSTypes';

export class SMSPermissionManager {
  private smsPlugin?: SmsPlugin;

  constructor(smsPlugin?: SmsPlugin) {
    this.smsPlugin = smsPlugin;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: "SMS Detection Available on Mobile",
          description: "SMS auto-detection works when the app is installed on Android/iOS devices.",
        });
        return false;
      }

      if (!this.smsPlugin) {
        console.log('❌ SMS plugin not available for permission request');
        toast({
          title: "SMS Plugin Setup Required",
          description: "Please follow the setup instructions to enable SMS detection on this device.",
          variant: "destructive",
        });
        return false;
      }

      // First, try to request notification permissions if available
      await this.requestNotificationPermissions();

      console.log('=== Starting SMS permission request ===');
      
      try {
        const result = await this.smsPlugin.requestPermissions();
        console.log('=== SMS permission request completed ===');
        console.log('Raw result:', JSON.stringify(result, null, 2));
        
        // Parse the result to check if permissions were granted
        const hasPermission = this.parsePermissionStatus(result);
        console.log('Parsed permission status after request:', hasPermission);
        
        if (hasPermission) {
          toast({
            title: "SMS Permission Granted",
            description: "The app can now detect transactions from SMS messages.",
          });
          return true;
        } else {
          // Wait and recheck multiple times with different strategies
          console.log('Initial check failed, starting comprehensive recheck...');
          
          const recheckStrategies = [
            { delay: 1000, name: 'Quick recheck' },
            { delay: 3000, name: 'Medium delay recheck' },
            { delay: 5000, name: 'Long delay recheck' }
          ];
          
          for (const strategy of recheckStrategies) {
            console.log(`${strategy.name} - waiting ${strategy.delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, strategy.delay));
            
            const recheckResult = await this.checkPermissions();
            console.log(`${strategy.name} result:`, recheckResult);
            
            if (recheckResult) {
              toast({
                title: "SMS Permission Granted",
                description: "The app can now detect transactions from SMS messages.",
              });
              return true;
            }
          }
          
          toast({
            title: "SMS Permissions Required",
            description: "Please grant SMS permissions in your device settings to enable transaction detection.",
            variant: "destructive",
          });
          return false;
        }
      } catch (pluginError) {
        console.error('SMS plugin method failed:', pluginError);
        
        // Check for specific error types
        if (pluginError.message && pluginError.message.includes('not implemented')) {
          toast({
            title: "SMS Plugin Not Supported",
            description: "SMS detection is not available on this platform. Please run 'npx cap sync' to install required plugins.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "SMS Permission Error",
            description: "Unable to request SMS permissions. Plugin may need to be properly installed.",
            variant: "destructive",
          });
        }
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Provide specific guidance based on error type
      if (error.message && error.message.includes('not implemented')) {
        toast({
          title: "Plugin Setup Required",
          description: "SMS plugin needs to be synced with 'npx cap sync' and the app rebuilt.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "SMS Setup Issue",
          description: "SMS plugin installation may be incomplete. Check console for details.",
          variant: "destructive",
        });
      }
      return false;
    }
  }

  private async requestNotificationPermissions(): Promise<void> {
    try {
      // Try to request notification permissions using different methods
      if ((window as any).Capacitor && (window as any).Capacitor.Plugins) {
        const plugins = (window as any).Capacitor.Plugins;
        if (plugins.LocalNotifications) {
          console.log('Requesting notification permissions...');
          const notificationResult = await plugins.LocalNotifications.requestPermissions();
          console.log('Notification permission result:', notificationResult);
        } else {
          console.log('LocalNotifications plugin not available');
        }
      } else if ((window as any).LocalNotifications) {
        console.log('Requesting notification permissions via global LocalNotifications...');
        const notificationResult = await (window as any).LocalNotifications.requestPermissions();
        console.log('Notification permission result:', notificationResult);
      } else {
        console.log('LocalNotifications plugin not found');
      }
    } catch (error) {
      console.log('Could not request notification permissions:', error.message);
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('Not on native platform, returning false');
        return false;
      }

      if (!this.smsPlugin) {
        console.log('❌ SMS plugin not available for permission check');
        console.log('This indicates the capacitor-sms plugin is not properly loaded');
        console.log('Please ensure:');
        console.log('1. Plugin is installed: npm install capacitor-sms');
        console.log('2. Plugin is synced: npx cap sync');
        console.log('3. App is rebuilt after plugin installation');
        return false;
      }
      
      console.log('=== Checking SMS permissions ===');
      console.log('Plugin available for check:', !!this.smsPlugin);
      
      try {
        const result = await this.smsPlugin.checkPermissions();
        console.log('=== SMS permission check completed ===');
        console.log('Raw check result:', JSON.stringify(result, null, 2));
        
        const hasPermission = this.parsePermissionStatus(result);
        console.log('Final permission check result:', hasPermission);
        
        return hasPermission;
      } catch (pluginError) {
        console.error('SMS plugin check method failed:', pluginError);
        
        if (pluginError.message && pluginError.message.includes('not implemented')) {
          console.log('SMS plugin not implemented on this platform');
        }
        
        return false;
      }
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  private parsePermissionStatus(result: SMSPermissionResult): boolean {
    if (!result) {
      console.log('No permission result to parse');
      return false;
    }

    console.log('=== Parsing permission status ===');
    console.log('Input result:', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result || {}));
    
    // Check if permissions are granted based on the actual type structure
    const hasReceivePermission = result.receive === 'granted';
    const hasSendPermission = result.send === 'granted';
    
    console.log('Parsed permissions:');
    console.log('- receive:', result.receive, '→', hasReceivePermission);
    console.log('- send:', result.send, '→', hasSendPermission);
    
    // For SMS detection, we primarily need receive permission
    const finalResult = hasReceivePermission;
    console.log('Final permission result:', finalResult);
    
    return finalResult;
  }

  // Enhanced force refresh with better error handling
  async forceRefreshPermissions(): Promise<boolean> {
    console.log('=== FORCE REFRESH PERMISSIONS STARTING ===');
    
    if (!this.smsPlugin) {
      console.log('❌ No SMS plugin available for force refresh');
      console.log('This means the capacitor-sms plugin is not loaded at all');
      
      toast({
        title: "Plugin Setup Required",
        description: "SMS plugin needs to be installed and synced. Run 'npx cap sync' and rebuild the app.",
        variant: "destructive",
      });
      return false;
    }
    
    console.log('✓ SMS plugin is available for force refresh');
    console.log('Plugin type:', typeof this.smsPlugin);
    
    try {
      // Strategy 1: Rapid multiple checks
      console.log('Strategy 1: Rapid multiple checks');
      for (let i = 0; i < 5; i++) {
        console.log(`  Attempt ${i + 1}/5...`);
        const result = await this.checkPermissions();
        console.log(`  Result ${i + 1}:`, result);
        
        if (result) {
          console.log(`✓ Permission detected on rapid check attempt ${i + 1}`);
          return true;
        }
        
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Strategy 2: Request permissions again to refresh state
      console.log('Strategy 2: Re-requesting permissions to refresh state');
      try {
        const requestResult = await this.smsPlugin.requestPermissions();
        console.log('Re-request result:', JSON.stringify(requestResult, null, 2));
        
        // Check immediately after request
        await new Promise(resolve => setTimeout(resolve, 1000));
        const immediateCheck = await this.checkPermissions();
        console.log('Immediate check after re-request:', immediateCheck);
        
        if (immediateCheck) {
          console.log('✓ Permission detected after re-request');
          return true;
        }
      } catch (error) {
        console.log('Re-request failed:', error.message);
        if (error.message && error.message.includes('not implemented')) {
          toast({
            title: "Platform Not Supported",
            description: "SMS detection is not available on this device platform.",
            variant: "destructive",
          });
          return false;
        }
      }
      
      console.log('=== FORCE REFRESH COMPLETED - NO PERMISSIONS DETECTED ===');
      
      toast({
        title: "No SMS Permissions",
        description: "Please grant SMS permissions in device settings or check if the plugin is properly installed.",
        variant: "destructive",
      });
      
      return false;
      
    } catch (error) {
      console.error('Force refresh error:', error);
      
      if (error.message && error.message.includes('not implemented')) {
        toast({
          title: "Plugin Not Available",
          description: "SMS plugin is not implemented for this platform. Check plugin installation.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Permission Check Failed",
          description: "Unable to check SMS permissions. Plugin may need to be reinstalled.",
          variant: "destructive",
        });
      }
      
      return false;
    }
  }
}
