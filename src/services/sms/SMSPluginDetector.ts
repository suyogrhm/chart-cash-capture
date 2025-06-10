
import { Capacitor } from '@capacitor/core';

export class SMSPluginDetector {
  private static instance: SMSPluginDetector;
  
  private constructor() {}
  
  static getInstance(): SMSPluginDetector {
    if (!SMSPluginDetector.instance) {
      SMSPluginDetector.instance = new SMSPluginDetector();
    }
    return SMSPluginDetector.instance;
  }

  async detectAndLoadSMSPlugin(): Promise<any> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, no SMS plugin needed');
      return null;
    }

    console.log('=== SMS PLUGIN DETECTION STARTING ===');
    console.log('Platform:', Capacitor.getPlatform());
    console.log('Is native:', Capacitor.isNativePlatform());

    // Strategy 1: Try capacitor-sms-inbox plugin
    try {
      console.log('Strategy 1: Attempting to import capacitor-sms-inbox...');
      const smsModule = await import('capacitor-sms-inbox');
      console.log('SMS module imported:', smsModule);
      
      if (smsModule.SMSInboxReader) {
        console.log('✓ Found capacitor-sms-inbox plugin with SMSInboxReader');
        return smsModule.SMSInboxReader;
      }
      
      // Try default export if SMSInboxReader is not available
      if (smsModule.default) {
        console.log('✓ Found capacitor-sms-inbox plugin with default export');
        return smsModule.default;
      }
    } catch (error: any) {
      console.log('SMS Inbox plugin not available:', error.message);
    }

    // Strategy 2: Try registerPlugin approach
    try {
      console.log('Strategy 2: Attempting registerPlugin...');
      const { registerPlugin } = await import('@capacitor/core');
      
      const pluginIds = ['SMSInboxReader', 'SmsInbox', 'Sms', 'SMS', 'CapacitorSms'];
      
      for (const pluginId of pluginIds) {
        try {
          console.log(`Trying to register plugin with ID: ${pluginId}`);
          const smsPlugin = registerPlugin(pluginId);
          
          if (smsPlugin && typeof smsPlugin === 'object') {
            // Check if it has SMS-like methods
            const hasSmsMethod = 'checkPermissions' in smsPlugin || 'requestPermissions' in smsPlugin || 'getMessages' in smsPlugin;
            if (hasSmsMethod) {
              console.log(`✓ Successfully registered plugin with ID: ${pluginId}`);
              return smsPlugin;
            }
          }
        } catch (error: any) {
          console.log(`Failed to register plugin ${pluginId}:`, error.message);
        }
      }
    } catch (error: any) {
      console.log('Strategy 2 failed:', error.message);
    }

    // Strategy 3: Check global window objects
    console.log('Strategy 3: Checking global window objects...');
    const possibleNames = ['SMSInboxReader', 'SmsInbox', 'Sms', 'SMS', 'CapacitorSms'];

    for (const name of possibleNames) {
      if ((window as any)[name]) {
        console.log(`✓ Found plugin at window.${name}`);
        return (window as any)[name];
      }
    }

    console.log('❌ SMS PLUGIN DETECTION FAILED - NO PLUGIN FOUND');
    return null;
  }

  logAvailableCapacitorInfo() {
    console.log('=== CAPACITOR DEBUG INFO ===');
    console.log('window.Capacitor exists:', !!(window as any).Capacitor);
    
    if ((window as any).Capacitor) {
      const capacitor = (window as any).Capacitor;
      console.log('Capacitor keys:', Object.keys(capacitor));
      console.log('Platform:', capacitor.getPlatform?.());
      console.log('isNativePlatform:', capacitor.isNativePlatform?.());
      
      if (capacitor.Plugins) {
        console.log('Plugins available:', Object.keys(capacitor.Plugins));
      } else {
        console.log('No Plugins object found');
      }
    }
  }
}
