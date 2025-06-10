
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

      const result = await this.smsPlugin.requestPermissions();
      console.log('Permission request result:', result);
      
      // After requesting, wait a bit and then check current permissions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      
      // Try multiple ways to check if permissions are granted
      const hasReceivePermission = result.receive === 'granted' || result.granted === true;
      const hasSendPermission = result.send === 'granted' || result.granted === true;
      
      console.log('Parsed permissions - receive:', hasReceivePermission, 'send:', hasSendPermission);
      
      // For SMS detection, we primarily need receive permission
      // Some plugins might only return a single 'granted' property
      const hasPermission = hasReceivePermission || result.granted === true;
      
      console.log('Final permission result:', hasPermission);
      
      return hasPermission;
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      // If there's an error checking permissions, assume we don't have them
      return false;
    }
  }

  // Force refresh permission status by making multiple checks
  async forceRefreshPermissions(): Promise<boolean> {
    console.log('Force refreshing permissions...');
    
    // Try checking multiple times with small delays
    for (let i = 0; i < 3; i++) {
      const result = await this.checkPermissions();
      console.log(`Permission check attempt ${i + 1}:`, result);
      
      if (result) {
        return true;
      }
      
      // Wait a bit before next check
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return false;
  }
}
