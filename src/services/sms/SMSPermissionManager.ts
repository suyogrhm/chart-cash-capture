
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
        toast({
          title: "SMS Plugin Not Available",
          description: "SMS plugin needs to be installed. Please sync the project with 'npx cap sync'.",
          variant: "destructive",
        });
        return false;
      }

      // First, try to request notification permissions if available
      await this.requestNotificationPermissions();

      // Show requesting permission toast
      toast({
        title: "Requesting SMS Permission",
        description: "Please allow SMS access in the system dialog that appears.",
      });

      console.log('=== Starting SMS permission request ===');
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
          title: "SMS Permission Required",
          description: "Please manually grant SMS permissions in your device settings to enable automatic transaction detection.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: "Permission Error",
        description: "Failed to request SMS permissions. Please grant them manually in device settings.",
        variant: "destructive",
      });
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
        console.log('SMS plugin not available');
        return false;
      }
      
      console.log('=== Checking SMS permissions ===');
      const result = await this.smsPlugin.checkPermissions();
      console.log('=== SMS permission check completed ===');
      console.log('Raw check result:', JSON.stringify(result, null, 2));
      
      const hasPermission = this.parsePermissionStatus(result);
      console.log('Final permission check result:', hasPermission);
      
      return hasPermission;
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

  // Enhanced force refresh with multiple strategies and comprehensive logging
  async forceRefreshPermissions(): Promise<boolean> {
    console.log('=== FORCE REFRESH PERMISSIONS STARTING ===');
    
    if (!this.smsPlugin) {
      console.log('No SMS plugin available for force refresh');
      return false;
    }
    
    // Strategy 1: Rapid multiple checks
    console.log('Strategy 1: Rapid multiple checks');
    for (let i = 0; i < 10; i++) {
      console.log(`  Attempt ${i + 1}/10...`);
      const result = await this.checkPermissions();
      console.log(`  Result ${i + 1}:`, result);
      
      if (result) {
        console.log(`✓ Permission detected on rapid check attempt ${i + 1}`);
        return true;
      }
      
      if (i < 9) {
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
    }
    
    // Strategy 3: Delayed checks with exponential backoff
    console.log('Strategy 3: Delayed checks with exponential backoff');
    const delays = [2000, 4000, 8000];
    
    for (let i = 0; i < delays.length; i++) {
      console.log(`  Waiting ${delays[i]}ms before check ${i + 1}...`);
      await new Promise(resolve => setTimeout(resolve, delays[i]));
      
      const result = await this.checkPermissions();
      console.log(`  Delayed check ${i + 1} result:`, result);
      
      if (result) {
        console.log(`✓ Permission detected on delayed check ${i + 1}`);
        return true;
      }
    }
    
    // Strategy 4: System-level permission check (if available)
    console.log('Strategy 4: Attempting system-level permission check');
    try {
      // Try to access device info or permissions plugin
      if ((window as any).Capacitor && (window as any).Capacitor.Plugins) {
        const plugins = (window as any).Capacitor.Plugins;
        if (plugins.Device) {
          const deviceInfo = await plugins.Device.getInfo();
          console.log('Device info:', deviceInfo);
        }
      } else if ((window as any).Device) {
        const deviceInfo = await (window as any).Device.getInfo();
        console.log('Device info:', deviceInfo);
      }
      
      // Final check after system queries
      const finalCheck = await this.checkPermissions();
      console.log('Final system check result:', finalCheck);
      
      if (finalCheck) {
        console.log('✓ Permission detected in final system check');
        return true;
      }
    } catch (error) {
      console.log('System check failed:', error.message);
    }
    
    console.log('=== FORCE REFRESH FAILED - NO PERMISSIONS DETECTED ===');
    console.log('Debug information:');
    console.log('- Platform:', Capacitor.getPlatform());
    console.log('- Is native:', Capacitor.isNativePlatform());
    console.log('- SMS plugin available:', !!this.smsPlugin);
    
    return false;
  }
}
