import { Capacitor } from '@capacitor/core';
import { TransactionCallback, SmsPlugin } from '@/types/SMSTypes';
import { SMSPermissionManager } from './sms/SMSPermissionManager';
import { SMSProcessor } from './sms/SMSProcessor';
import { SMSListenerManager } from './sms/SMSListenerManager';
import { SMSPluginDetector } from './sms/SMSPluginDetector';

// Mock implementation for web and runtime plugin loading for native
class CapacitorSmsWrapper implements SmsPlugin {
  private smsPlugin: any = null;
  private initialized = false;
  private detector: SMSPluginDetector;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.detector = SMSPluginDetector.getInstance();
  }

  private async initializePlugin(): Promise<void> {
    // Prevent multiple simultaneous initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    if (this.initialized && this.smsPlugin) {
      return Promise.resolve();
    }
    
    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping SMS plugin initialization');
      this.initialized = true;
      return;
    }
    
    try {
      console.log('=== INITIALIZING SMS PLUGIN ===');
      
      // Log debug info first
      this.detector.logAvailableCapacitorInfo();
      
      // Attempt to detect and load the plugin
      this.smsPlugin = await this.detector.detectAndLoadSMSPlugin();
      
      if (this.smsPlugin) {
        console.log('✓ SMS plugin successfully loaded and stored');
        console.log('Plugin object type:', typeof this.smsPlugin);
        console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.smsPlugin || {})));
        
        // Test if we can call a basic method
        try {
          if (typeof this.smsPlugin.checkPermissions === 'function') {
            console.log('✓ checkPermissions method is callable');
          } else if (typeof this.smsPlugin.checkPermission === 'function') {
            console.log('✓ checkPermission method is callable');
          } else {
            console.log('⚠ No standard permission check method found');
            console.log('Available methods on plugin:', Object.getOwnPropertyNames(this.smsPlugin));
          }
        } catch (testError) {
          console.log('Plugin test failed:', testError.message);
        }
        
      } else {
        console.log('❌ SMS plugin not found');
      }
    } catch (error) {
      console.error('Failed to load SMS plugin:', error);
      this.smsPlugin = null;
    } finally {
      this.initialized = true;
      this.initializationPromise = null;
    }
  }

  async requestPermissions() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      console.log('❌ SMS plugin not available for permission request');
      return { receive: 'denied', send: 'denied' };
    }
    
    try {
      console.log('📱 Requesting permissions via SMS plugin...');
      console.log('Plugin available for request:', !!this.smsPlugin);
      
      let result;
      
      // Try different method names the plugin might use
      if (typeof this.smsPlugin.requestPermissions === 'function') {
        console.log('Using requestPermissions method');
        result = await this.smsPlugin.requestPermissions();
      } else if (typeof this.smsPlugin.requestPermission === 'function') {
        console.log('Using requestPermission method');
        result = await this.smsPlugin.requestPermission();
      } else if (typeof this.smsPlugin.checkPermissions === 'function') {
        console.log('No request method, trying checkPermissions');
        result = await this.smsPlugin.checkPermissions();
      } else {
        console.error('❌ No permission request method found on SMS plugin');
        console.error('Available methods:', Object.getOwnPropertyNames(this.smsPlugin));
        return { receive: 'denied', send: 'denied' };
      }
      
      console.log('📱 Raw permission request result:', JSON.stringify(result, null, 2));
      
      return this.parsePermissionResult(result, 'request');
    } catch (error) {
      console.error('❌ Error requesting SMS permissions:', error);
      return { receive: 'denied', send: 'denied' };
    }
  }

  async checkPermissions() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      console.log('❌ SMS plugin not available for permission check');
      console.log('Plugin state - initialized:', this.initialized, 'plugin:', !!this.smsPlugin);
      return { receive: 'denied', send: 'denied' };
    }

    try {
      console.log('🔍 Checking permissions via SMS plugin...');
      console.log('Plugin available for check:', !!this.smsPlugin);
      
      let result;
      
      // Try different method names
      if (typeof this.smsPlugin.checkPermissions === 'function') {
        console.log('Using checkPermissions method');
        result = await this.smsPlugin.checkPermissions();
      } else if (typeof this.smsPlugin.checkPermission === 'function') {
        console.log('Using checkPermission method');
        result = await this.smsPlugin.checkPermission();
      } else if (typeof this.smsPlugin.hasPermission === 'function') {
        console.log('Using hasPermission method');
        result = await this.smsPlugin.hasPermission();
      } else {
        console.error('❌ No permission check method found on SMS plugin');
        console.error('Available methods:', Object.getOwnPropertyNames(this.smsPlugin));
        return { receive: 'denied', send: 'denied' };
      }
      
      console.log('🔍 Raw permission check result:', JSON.stringify(result, null, 2));
      
      return this.parsePermissionResult(result, 'check');
    } catch (error) {
      console.error('❌ Error checking SMS permissions:', error);
      return { receive: 'denied', send: 'denied' };
    }
  }

  private parsePermissionResult(result: any, operation: 'request' | 'check'): { receive: string; send: string } {
    console.log(`=== Parsing ${operation} permission result ===`);
    console.log('Raw result:', result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result || {}));
    console.log('Result stringified:', JSON.stringify(result, null, 2));
    
    if (!result) {
      console.log('No result returned - defaulting to denied');
      return { receive: 'denied', send: 'denied' };
    }

    // Strategy 1: Check for standard Capacitor permission format
    if (result.receive !== undefined || result.send !== undefined) {
      const parsed = {
        receive: result.receive || 'denied',
        send: result.send || 'denied'
      };
      console.log('✓ Found standard format:', parsed);
      return parsed;
    }
    
    // Strategy 2: Check for nested permissions object
    if (result.permissions && typeof result.permissions === 'object') {
      console.log('Found nested permissions:', result.permissions);
      return {
        receive: result.permissions.receive || result.permissions.readSms || result.permissions.receiveSms || 'denied',
        send: result.permissions.send || result.permissions.sendSms || 'denied'
      };
    }
    
    // Strategy 3: Check for SMS-specific properties
    const smsProperties = ['readSms', 'receiveSms', 'sendSms', 'sms', 'SMS_RECEIVE', 'SMS_SEND'];
    const foundProps = smsProperties.filter(prop => result[prop] !== undefined);
    
    if (foundProps.length > 0) {
      console.log('Found SMS-specific properties:', foundProps);
      const receiveGranted = ['readSms', 'receiveSms', 'sms', 'SMS_RECEIVE'].some(prop => 
        result[prop] === true || result[prop] === 'granted' || result[prop] === 'authorized'
      );
      const sendGranted = ['sendSms', 'sms', 'SMS_SEND'].some(prop => 
        result[prop] === true || result[prop] === 'granted' || result[prop] === 'authorized'
      );
      
      const parsed = {
        receive: receiveGranted ? 'granted' : 'denied',
        send: sendGranted ? 'granted' : 'denied'
      };
      console.log('✓ Parsed SMS properties:', parsed);
      return parsed;
    }
    
    // Strategy 4: Check for boolean granted/allowed properties
    const booleanProps = ['granted', 'allowed', 'permitted', 'enabled', 'authorized'];
    for (const prop of booleanProps) {
      if (result[prop] !== undefined) {
        const isGranted = result[prop] === true || result[prop] === 'granted' || result[prop] === 'allowed';
        const status = isGranted ? 'granted' : 'denied';
        console.log(`✓ Found ${prop} property:`, result[prop], '- status:', status);
        return { receive: status, send: status };
      }
    }
    
    // Strategy 5: Check for direct boolean result
    if (typeof result === 'boolean') {
      const status = result ? 'granted' : 'denied';
      console.log('✓ Boolean result:', result, '- status:', status);
      return { receive: status, send: status };
    }
    
    // Strategy 6: String analysis for positive indicators
    const resultString = JSON.stringify(result).toLowerCase();
    const positiveIndicators = ['granted', 'allowed', 'permitted', 'authorized', 'true', 'yes'];
    const hasPositive = positiveIndicators.some(indicator => resultString.includes(indicator));
    
    if (hasPositive) {
      console.log('✓ Found positive indicators in result string');
      return { receive: 'granted', send: 'granted' };
    }
    
    // Strategy 7: Check all property values for permission states
    const allValues = Object.values(result || {}).flat();
    const hasGranted = allValues.some(value => 
      value === 'granted' || value === 'allowed' || value === true || value === 'authorized'
    );
    
    if (hasGranted) {
      console.log('✓ Found granted permission in property values');
      return { receive: 'granted', send: 'granted' };
    }
    
    // Ultimate fallback
    console.warn('❌ Unable to parse permission result - defaulting to denied');
    console.warn('Result details:');
    console.warn('- Type:', typeof result);
    console.warn('- Constructor:', result?.constructor?.name);
    console.warn('- Keys:', Object.keys(result || {}));
    console.warn('- Values:', Object.values(result || {}));
    console.warn('- String representation:', String(result));
    
    return { receive: 'denied', send: 'denied' };
  }

  async addListener(event: string, callback: (message: { body: string; address: string }) => void) {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    
    // Try different event names and listener methods
    const eventNames = ['smsReceived', 'sms', 'messageReceived'];
    const listenerMethods = ['addListener', 'addEventListener', 'on'];
    
    for (const eventName of eventNames) {
      for (const method of listenerMethods) {
        if (typeof this.smsPlugin[method] === 'function') {
          try {
            console.log(`Trying ${method}('${eventName}', callback)`);
            return await this.smsPlugin[method](eventName, callback);
          } catch (error) {
            console.log(`Failed with ${method}('${eventName}'):`, error.message);
          }
        }
      }
    }
    
    throw new Error('No compatible listener method found on SMS plugin');
  }

  async startWatching() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    
    // Try different start methods
    const startMethods = ['startWatch', 'startWatching', 'start', 'enable'];
    
    for (const method of startMethods) {
      if (typeof this.smsPlugin[method] === 'function') {
        try {
          console.log(`Trying ${method}()`);
          return await this.smsPlugin[method]();
        } catch (error) {
          console.log(`Failed with ${method}():`, error.message);
        }
      }
    }
    
    console.log('No start method found, SMS might work without explicit start');
    return Promise.resolve();
  }

  async stopWatching() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    
    // Try different stop methods
    const stopMethods = ['stopWatch', 'stopWatching', 'stop', 'disable'];
    
    for (const method of stopMethods) {
      if (typeof this.smsPlugin[method] === 'function') {
        try {
          console.log(`Trying ${method}()`);
          return await this.smsPlugin[method]();
        } catch (error) {
          console.log(`Failed with ${method}():`, error.message);
        }
      }
    }
    
    console.log('No stop method found');
    return Promise.resolve();
  }

  // Method to check if plugin is available (for debugging)
  isPluginAvailable(): boolean {
    return !!this.smsPlugin;
  }
}

export class SMSService {
  private static instance: SMSService;
  private smsPlugin?: SmsPlugin;
  private permissionManager: SMSPermissionManager;
  private processor: SMSProcessor;
  private listenerManager: SMSListenerManager;

  private constructor() {
    this.initializeSMSPlugin();
    this.permissionManager = new SMSPermissionManager(this.smsPlugin);
    this.processor = new SMSProcessor();
    this.listenerManager = new SMSListenerManager(this.smsPlugin, this.processor);
  }

  private async initializeSMSPlugin() {
    if (Capacitor.isNativePlatform()) {
      try {
        this.smsPlugin = new CapacitorSmsWrapper();
        console.log('SMS plugin wrapper created successfully');
      } catch (error) {
        console.warn('SMS plugin initialization failed:', error);
        this.smsPlugin = undefined;
      }
    } else {
      console.log('SMS plugin not available - running in web mode');
      this.smsPlugin = undefined;
    }
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    return this.permissionManager.requestPermissions();
  }

  async checkPermissions(): Promise<boolean> {
    return this.permissionManager.checkPermissions();
  }

  async forceRefreshPermissions(): Promise<boolean> {
    return this.permissionManager.forceRefreshPermissions();
  }

  setTransactionCallback(callback: TransactionCallback) {
    this.processor.setTransactionCallback(callback);
  }

  async startListening(): Promise<boolean> {
    const hasPermission = await this.permissionManager.checkPermissions();
    if (Capacitor.isNativePlatform() && !hasPermission) {
      const granted = await this.permissionManager.requestPermissions();
      if (!granted) return false;
    }

    return this.listenerManager.startListening();
  }

  stopListening() {
    this.listenerManager.stopListening();
  }

  getListeningStatus(): boolean {
    return this.listenerManager.getListeningStatus();
  }

  // Debug method to check plugin status
  debugPluginStatus() {
    if (this.smsPlugin && typeof (this.smsPlugin as any).isPluginAvailable === 'function') {
      console.log('Plugin available:', (this.smsPlugin as any).isPluginAvailable());
    }
  }
}

export const smsService = SMSService.getInstance();
