
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

    // Strategy 1: Check if plugin is available through Capacitor.registerPlugin
    try {
      console.log('Strategy 1: Attempting to register capacitor-sms plugin...');
      const { CapacitorSms } = await import('capacitor-sms');
      if (CapacitorSms) {
        console.log('✓ Found CapacitorSms import');
        return CapacitorSms;
      }
    } catch (error) {
      console.log('Strategy 1 failed:', error.message);
    }

    // Strategy 2: Check global window objects
    console.log('Strategy 2: Checking global window objects...');
    const possibleNames = [
      'CapacitorSms',
      'SMS', 
      'SmsManager',
      'SmsPlugin',
      'Sms'
    ];

    for (const name of possibleNames) {
      if ((window as any)[name]) {
        console.log(`✓ Found plugin at window.${name}`);
        return (window as any)[name];
      }
    }

    // Strategy 3: Check Capacitor.Plugins (if available)
    if ((window as any).Capacitor && (window as any).Capacitor.Plugins) {
      console.log('Strategy 3: Checking Capacitor.Plugins...');
      const plugins = (window as any).Capacitor.Plugins;
      console.log('Available plugins:', Object.keys(plugins));
      
      for (const name of possibleNames) {
        if (plugins[name]) {
          console.log(`✓ Found plugin at Capacitor.Plugins.${name}`);
          return plugins[name];
        }
      }
    }

    // Strategy 4: Check if plugin is registered but under a different name
    console.log('Strategy 4: Checking for any SMS-related global objects...');
    const allWindowKeys = Object.getOwnPropertyNames(window);
    const smsRelatedKeys = allWindowKeys.filter(key => 
      key.toLowerCase().includes('sms') || 
      key.toLowerCase().includes('message')
    );
    
    if (smsRelatedKeys.length > 0) {
      console.log('Found SMS-related window properties:', smsRelatedKeys);
      
      // Try the first SMS-related key
      for (const key of smsRelatedKeys) {
        const obj = (window as any)[key];
        if (obj && typeof obj === 'object') {
          // Check if it has SMS plugin methods
          if (this.looksLikeSMSPlugin(obj)) {
            console.log(`✓ Found SMS plugin at window.${key}`);
            return obj;
          }
        }
      }
    }

    // Strategy 5: Try to access through native bridge directly
    console.log('Strategy 5: Attempting direct native bridge access...');
    try {
      if ((window as any).Capacitor && (window as any).Capacitor.Plugins) {
        // Try to manually register the plugin
        const { registerPlugin } = await import('@capacitor/core');
        const smsPlugin = registerPlugin('CapacitorSms');
        console.log('✓ Manually registered plugin:', smsPlugin);
        return smsPlugin;
      }
    } catch (error) {
      console.log('Strategy 5 failed:', error.message);
    }

    console.log('❌ SMS PLUGIN DETECTION FAILED - NO PLUGIN FOUND');
    console.log('Debug info:');
    console.log('- Available window keys (SMS-related):', smsRelatedKeys);
    console.log('- Capacitor available:', !!(window as any).Capacitor);
    console.log('- Capacitor.Plugins available:', !!((window as any).Capacitor?.Plugins));
    
    return null;
  }

  private looksLikeSMSPlugin(obj: any): boolean {
    const smsPluginMethods = [
      'requestPermissions',
      'checkPermissions', 
      'requestPermission',
      'checkPermission',
      'addListener',
      'startWatch',
      'startWatching'
    ];

    const hasRelevantMethods = smsPluginMethods.some(method => 
      typeof obj[method] === 'function'
    );

    if (hasRelevantMethods) {
      console.log('Object has SMS plugin methods:', 
        smsPluginMethods.filter(method => typeof obj[method] === 'function')
      );
    }

    return hasRelevantMethods;
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
    
    // Check for any Capacitor-related globals
    const allKeys = Object.getOwnPropertyNames(window);
    const capacitorKeys = allKeys.filter(key => 
      key.toLowerCase().includes('capacitor') || 
      key.toLowerCase().includes('plugin')
    );
    console.log('Capacitor-related globals:', capacitorKeys);
  }
}
