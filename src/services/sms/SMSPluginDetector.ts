
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

    // Strategy 1: Try registerPlugin first (most reliable for Capacitor 5+)
    try {
      console.log('Strategy 1: Attempting registerPlugin...');
      const { registerPlugin } = await import('@capacitor/core');
      
      // Try different plugin IDs that capacitor-sms might use
      const pluginIds = ['CapacitorSms', 'SMSPlugin', 'SMS', 'SmsManager'];
      
      for (const pluginId of pluginIds) {
        try {
          console.log(`Trying to register plugin with ID: ${pluginId}`);
          const smsPlugin = registerPlugin(pluginId);
          
          // Test if the plugin actually works
          if (typeof smsPlugin.checkPermissions === 'function') {
            console.log(`✓ Successfully registered plugin with ID: ${pluginId}`);
            return smsPlugin;
          }
        } catch (error) {
          console.log(`Failed to register plugin ${pluginId}:`, error.message);
        }
      }
    } catch (error) {
      console.log('Strategy 1 failed:', error.message);
    }

    // Strategy 2: Check if plugin is available through import
    try {
      console.log('Strategy 2: Attempting to import capacitor-sms plugin...');
      const smsModule = await import('capacitor-sms');
      console.log('SMS module imported:', smsModule);
      console.log('Module keys:', Object.keys(smsModule));
      
      // Try different possible exports
      if (smsModule.default) {
        console.log('✓ Found default export');
        return smsModule.default;
      } else if (smsModule.SMSWeb) {
        console.log('✓ Found SMSWeb export');
        return smsModule.SMSWeb;
      } else if (smsModule.SMSPluginWeb) {
        console.log('✓ Found SMSPluginWeb export');
        return smsModule.SMSPluginWeb;
      }
    } catch (error) {
      console.log('Strategy 2 failed:', error.message);
    }

    // Strategy 3: Check global window objects
    console.log('Strategy 3: Checking global window objects...');
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

    // Strategy 4: Check Capacitor.Plugins (if available)
    if ((window as any).Capacitor && (window as any).Capacitor.Plugins) {
      console.log('Strategy 4: Checking Capacitor.Plugins...');
      const plugins = (window as any).Capacitor.Plugins;
      console.log('Available plugins:', Object.keys(plugins));
      
      for (const name of possibleNames) {
        if (plugins[name]) {
          console.log(`✓ Found plugin at Capacitor.Plugins.${name}`);
          return plugins[name];
        }
      }
    }

    // Strategy 5: Check if plugin is registered but under a different name
    console.log('Strategy 5: Checking for any SMS-related global objects...');
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

    console.log('❌ SMS PLUGIN DETECTION FAILED - NO PLUGIN FOUND');
    console.log('This likely means:');
    console.log('1. The capacitor-sms plugin is not installed');
    console.log('2. The plugin is not synced to the native platform');
    console.log('3. The plugin does not support this platform');
    console.log('4. The plugin needs to be manually registered');
    
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
