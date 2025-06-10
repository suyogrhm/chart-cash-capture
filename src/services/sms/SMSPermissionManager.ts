
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
          title: "Manual Entry Available",
          description: "SMS permissions not available. You can still manually add transactions using the message input.",
          variant: "default",
        });
        return false;
      }

      const result = await this.smsPlugin.requestPermissions();
      
      if (result.receive === 'granted' && result.send === 'granted') {
        toast({
          title: "SMS Permission Granted",
          description: "The app can now detect transactions from SMS messages.",
        });
        return true;
      } else {
        toast({
          title: "SMS Permission Denied",
          description: "No worries! You can manually copy-paste SMS text or type transactions in the message input below.",
          variant: "default",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      toast({
        title: "Manual Entry Still Works",
        description: "SMS permissions not available, but you can manually add transactions using the input field.",
        variant: "default",
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
      return result.receive === 'granted' && result.send === 'granted';
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return false;
    }
  }
}
