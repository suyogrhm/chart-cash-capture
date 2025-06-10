
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
      
      // Check for granted permissions with more flexible checking
      const hasReceivePermission = result.receive === 'granted';
      const hasSendPermission = result.send === 'granted';
      
      console.log('Receive permission:', hasReceivePermission);
      console.log('Send permission:', hasSendPermission);
      
      if (hasReceivePermission && hasSendPermission) {
        toast({
          title: "SMS Permission Granted",
          description: "The app can now detect transactions from SMS messages.",
        });
        return true;
      } else if (result.receive === 'denied' || result.send === 'denied') {
        toast({
          title: "SMS Permission Denied",
          description: "Please grant SMS permissions in your device settings to enable automatic transaction detection.",
          variant: "destructive",
        });
        return false;
      } else {
        // Handle cases where permission might be granted but not reported correctly
        console.log('Permission status unclear, checking again...');
        const recheckResult = await this.checkPermissions();
        if (recheckResult) {
          toast({
            title: "SMS Permission Granted",
            description: "The app can now detect transactions from SMS messages.",
          });
          return true;
        }
        
        toast({
          title: "SMS Permission Required",
          description: "Please grant SMS permissions to automatically detect transactions.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      toast({
        title: "Permission Error",
        description: "Failed to request SMS permissions. You may need to grant them manually in device settings.",
        variant: "destructive",
      });
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      if (!this.smsPlugin) {
        return false;
      }
      
      const result = await this.smsPlugin.checkPermissions();
      console.log('Current permissions check result:', result);
      
      const hasReceivePermission = result.receive === 'granted';
      const hasSendPermission = result.send === 'granted';
      
      console.log('Current receive permission:', hasReceivePermission);
      console.log('Current send permission:', hasSendPermission);
      
      return hasReceivePermission && hasSendPermission;
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return false;
    }
  }
}
