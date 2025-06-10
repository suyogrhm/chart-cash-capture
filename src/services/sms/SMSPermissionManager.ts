
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

      // Show requesting permission toast
      toast({
        title: "Requesting SMS Permission",
        description: "Please allow SMS access in the system dialog that appears.",
      });

      console.log('Starting permission request...');
      const result = await this.smsPlugin.requestPermissions();
      console.log('Permission request result:', result);
      
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
        // Wait a bit and recheck permissions in case there's a delay
        console.log('Initial check failed, rechecking after delay...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const recheckResult = await this.checkPermissions();
        console.log('Recheck after request:', recheckResult);
        
        if (recheckResult) {
          toast({
            title: "SMS Permission Granted",
            description: "The app can now detect transactions from SMS messages.",
          });
          return true;
        } else {
          toast({
            title: "SMS Permission Required",
            description: "Please manually grant SMS permissions in your device settings to enable automatic transaction detection.",
            variant: "destructive",
          });
          return false;
        }
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request SMS permissions. Please grant them manually in device settings.",
        variant: "destructive",
      });
      return false;
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
      
      console.log('Checking SMS permissions...');
      const result = await this.smsPlugin.checkPermissions();
      console.log('Permission check raw result:', result);
      
      const hasPermission = this.parsePermissionStatus(result);
      console.log('Final permission result:', hasPermission);
      
      return hasPermission;
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      // If there's an error checking permissions, assume we don't have them
      return false;
    }
  }

  private parsePermissionStatus(result: SMSPermissionResult): boolean {
    if (!result) {
      console.log('No permission result to parse');
      return false;
    }

    console.log('Parsing permission status from:', result);
    
    // Check if permissions are granted based on the actual type structure
    const hasReceivePermission = result.receive === 'granted';
    const hasSendPermission = result.send === 'granted';
    
    console.log('Parsed permissions - receive:', hasReceivePermission, 'send:', hasSendPermission);
    
    // For SMS detection, we primarily need receive permission
    return hasReceivePermission;
  }

  // Force refresh permission status by making multiple checks with different strategies
  async forceRefreshPermissions(): Promise<boolean> {
    console.log('Force refreshing permissions...');
    
    // Strategy 1: Multiple rapid checks
    for (let i = 0; i < 5; i++) {
      console.log(`Permission check attempt ${i + 1}...`);
      const result = await this.checkPermissions();
      console.log(`Permission check attempt ${i + 1} result:`, result);
      
      if (result) {
        console.log('Permission detected on attempt', i + 1);
        return true;
      }
      
      // Wait a bit before next check
      if (i < 4) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Strategy 2: Try requesting permissions again (might refresh the status)
    console.log('Attempting permission request to refresh status...');
    try {
      if (this.smsPlugin) {
        await this.smsPlugin.requestPermissions();
        
        // Check again after request
        await new Promise(resolve => setTimeout(resolve, 1000));
        const finalCheck = await this.checkPermissions();
        console.log('Final check after request:', finalCheck);
        return finalCheck;
      }
    } catch (error) {
      console.log('Error during force refresh request:', error);
    }
    
    console.log('Force refresh failed - no permissions detected');
    return false;
  }
}
