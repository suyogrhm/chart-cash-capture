
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

    // Strategy 1: Try the new community plugin first
    try {
      console.log('Strategy 1: Attempting to import @capacitor-community/sms...');
      const smsModule = await import('@capacitor-community/sms');
      console.log('SMS module imported:', smsModule);
      
      if (smsModule.Sms) {
        console.log('✓ Found @capacitor-community/sms plugin');
        return smsModule.Sms;
      }
    } catch (error: any) {
      console.log('Community SMS plugin not available:', error.message);
    }

    // Strategy 2: Try registerPlugin approach
    try {
      console.log('Strategy 2: Attempting registerPlugin...');
      const { registerPlugin } = await import('@capacitor/core');
      
      const pluginIds = ['Sms', 'SMS', 'CapacitorSms'];
      
      for (const pluginId of pluginIds) {
        try {
          console.log(`Trying to register plugin with ID: ${pluginId}`);
          const smsPlugin = registerPlugin(pluginId);
          
          if (smsPlugin && typeof smsPlugin === 'object' && 'checkPermissions' in smsPlugin) {
            console.log(`✓ Successfully registered plugin with ID: ${pluginId}`);
            return smsPlugin;
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
    const possibleNames = ['Sms', 'SMS', 'CapacitorSms'];

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
