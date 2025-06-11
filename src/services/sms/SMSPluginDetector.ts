
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

    // Strategy 1: Try registerPlugin with correct plugin name first (most reliable)
    try {
      console.log('Strategy 1: Attempting registerPlugin with SMSInboxReader...');
      const { registerPlugin } = await import('@capacitor/core');
      
      const smsPlugin = registerPlugin('SMSInboxReader');
      
      if (smsPlugin && typeof smsPlugin === 'object') {
        console.log('✓ Successfully registered SMSInboxReader plugin');
        console.log('Plugin methods:', Object.keys(smsPlugin));
        return smsPlugin;
      }
    } catch (error: any) {
      console.log('Strategy 1 failed:', error.message);
    }

    // Strategy 2: Check Capacitor.Plugins directly
    console.log('Strategy 2: Checking Capacitor.Plugins...');
    if ((window as any).Capacitor && (window as any).Capacitor.Plugins) {
      const plugins = (window as any).Capacitor.Plugins;
      console.log('Available plugins:', Object.keys(plugins));
      
      if (plugins.SMSInboxReader) {
        console.log('✓ Found SMSInboxReader in Capacitor.Plugins');
        return plugins.SMSInboxReader;
      }
    }

    // Strategy 3: Try direct import (less reliable on native)
    try {
      console.log('Strategy 3: Attempting to import capacitor-sms-inbox...');
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
      console.log('Strategy 3 failed:', error.message);
    }

    // Strategy 4: Check global window objects
    console.log('Strategy 4: Checking global window objects...');
    const possibleNames = ['SMSInboxReader', 'SmsInbox'];

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
