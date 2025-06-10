
import { Capacitor } from '@capacitor/core';
import { TransactionCallback, SmsPlugin } from '@/types/SMSTypes';
import { SMSPermissionManager } from './sms/SMSPermissionManager';
import { SMSProcessor } from './sms/SMSProcessor';
import { SMSListenerManager } from './sms/SMSListenerManager';

// Mock implementation for web and runtime plugin loading for native
class CapacitorSmsWrapper implements SmsPlugin {
  private smsPlugin: any = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't initialize immediately to avoid build issues
  }

  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return !!this.smsPlugin;
    
    if (this.initializationPromise) {
      await this.initializationPromise;
      return !!this.smsPlugin;
    }

    this.initializationPromise = this.initializePlugin();
    await this.initializationPromise;
    return !!this.smsPlugin;
  }

  private async initializePlugin(): Promise<void> {
    this.initialized = true;
    
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping SMS plugin initialization');
      this.smsPlugin = null;
      return;
    }
    
    try {
      console.log('Attempting to load SMS plugin...');
      
      // Multiple attempts to load the plugin with different methods
      let smsModule = null;
      
      // Method 1: Direct import
      try {
        smsModule = await import('capacitor-sms');
        console.log('SMS plugin loaded via direct import:', !!smsModule);
      } catch (e) {
        console.log('Direct import failed, trying eval method:', e);
      }
      
      // Method 2: Eval-based dynamic import
      if (!smsModule) {
        try {
          const importFunction = new Function('specifier', 'return import(specifier)');
          smsModule = await importFunction('capacitor-sms');
          console.log('SMS plugin loaded via eval import:', !!smsModule);
        } catch (e) {
          console.log('Eval import failed:', e);
        }
      }
      
      if (smsModule) {
        // Try different plugin access patterns
        this.smsPlugin = smsModule.default || smsModule.SmsManager || smsModule.SMS || smsModule;
        console.log('SMS plugin object:', this.smsPlugin);
        console.log('SMS plugin methods:', Object.keys(this.smsPlugin || {}));
        
        // Test if the plugin has required methods
        if (this.smsPlugin && typeof this.smsPlugin.checkPermissions === 'function') {
          console.log('SMS plugin successfully initialized with required methods');
        } else {
          console.warn('SMS plugin loaded but missing required methods');
          this.smsPlugin = null;
        }
      } else {
        console.warn('SMS plugin module not found');
        this.smsPlugin = null;
      }
    } catch (error) {
      console.error('Failed to load SMS plugin:', error);
      this.smsPlugin = null;
    }
  }

  async requestPermissions() {
    const pluginReady = await this.ensureInitialized();
    
    if (!pluginReady || !this.smsPlugin) {
      console.log('SMS plugin not available for permission request');
      return { receive: 'denied', send: 'denied' };
    }
    
    try {
      console.log('Requesting permissions via SMS plugin...');
      const result = await this.smsPlugin.requestPermissions();
      console.log('Raw permission request result:', JSON.stringify(result, null, 2));
      
      return this.parsePermissionResult(result, 'request');
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      return { receive: 'denied', send: 'denied' };
    }
  }

  async checkPermissions() {
    const pluginReady = await this.ensureInitialized();
    
    if (!pluginReady || !this.smsPlugin) {
      console.log('SMS plugin not available for permission check');
      return { receive: 'denied', send: 'denied' };
    }

    try {
      console.log('Checking permissions via SMS plugin...');
      const result = await this.smsPlugin.checkPermissions();
      console.log('Raw permission check result:', JSON.stringify(result, null, 2));
      
      return this.parsePermissionResult(result, 'check');
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return { receive: 'denied', send: 'denied' };
    }
  }

  private parsePermissionResult(result: any, operation: 'request' | 'check'): { receive: string; send: string } {
    console.log(`Parsing ${operation} permission result:`, result);
    console.log('Result type:', typeof result);
    console.log('Result keys:', Object.keys(result || {}));
    
    if (!result) {
      console.log('No result returned');
      return { receive: 'denied', send: 'denied' };
    }

    // Handle different response formats from capacitor-sms plugin
    
    // Format 1: Direct receive/send properties
    if (result.receive !== undefined && result.send !== undefined) {
      console.log('Found direct receive/send properties:', { receive: result.receive, send: result.send });
      return {
        receive: result.receive,
        send: result.send
      };
    }
    
    // Format 2: Nested permissions object
    if (result.permissions && typeof result.permissions === 'object') {
      console.log('Found nested permissions:', result.permissions);
      return {
        receive: result.permissions.receive || result.permissions.readSms || result.permissions.receiveSms || 'denied',
        send: result.permissions.send || result.permissions.sendSms || 'denied'
      };
    }
    
    // Format 3: Individual permission properties (common in some plugins)
    if (result.readSms !== undefined || result.receiveSms !== undefined || result.sendSms !== undefined) {
      const receiveGranted = result.readSms === true || result.receiveSms === true || 
                           result.readSms === 'granted' || result.receiveSms === 'granted';
      const sendGranted = result.sendSms === true || result.sendSms === 'granted';
      
      console.log('Found individual SMS permissions:', { 
        readSms: result.readSms, 
        receiveSms: result.receiveSms, 
        sendSms: result.sendSms,
        receiveGranted,
        sendGranted
      });
      
      return {
        receive: receiveGranted ? 'granted' : 'denied',
        send: sendGranted ? 'granted' : 'denied'
      };
    }
    
    // Format 4: Boolean granted property (legacy)
    if (typeof result.granted === 'boolean') {
      const status = result.granted ? 'granted' : 'denied';
      console.log('Found boolean granted property:', result.granted, 'status:', status);
      return {
        receive: status,
        send: status
      };
    }
    
    // Format 5: String status property
    if (result.status) {
      const status = result.status === 'granted' || result.status === true ? 'granted' : 'denied';
      console.log('Found status property:', result.status, 'parsed:', status);
      return {
        receive: status,
        send: status
      };
    }
    
    // Format 6: Direct boolean response
    if (typeof result === 'boolean') {
      const status = result ? 'granted' : 'denied';
      console.log('Boolean result:', result, 'status:', status);
      return {
        receive: status,
        send: status
      };
    }
    
    // Format 7: Check for any property that might indicate granted status
    const possibleGrantedKeys = ['granted', 'allowed', 'permitted', 'enabled'];
    for (const key of possibleGrantedKeys) {
      if (result[key] !== undefined) {
        const isGranted = result[key] === true || result[key] === 'granted' || result[key] === 'allowed';
        const status = isGranted ? 'granted' : 'denied';
        console.log(`Found ${key} property:`, result[key], 'status:', status);
        return {
          receive: status,
          send: status
        };
      }
    }
    
    // Fallback: Check if any property suggests permission is granted
    const resultString = JSON.stringify(result).toLowerCase();
    if (resultString.includes('granted') || resultString.includes('allowed') || resultString.includes('true')) {
      console.log('Fallback: Found positive indicators in result string');
      return {
        receive: 'granted',
        send: 'granted'
      };
    }
    
    // Ultimate fallback
    console.warn('Unable to parse permission result, defaulting to denied:', result);
    console.warn('Available properties:', Object.keys(result || {}));
    return {
      receive: 'denied',
      send: 'denied'
    };
  }

  async addListener(event: string, callback: (message: { body: string; address: string }) => void) {
    const pluginReady = await this.ensureInitialized();
    
    if (!pluginReady || !this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    return this.smsPlugin.addListener('smsReceived', callback);
  }

  async startWatching() {
    const pluginReady = await this.ensureInitialized();
    
    if (!pluginReady || !this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    return this.smsPlugin.startWatch();
  }

  async stopWatching() {
    const pluginReady = await this.ensureInitialized();
    
    if (!pluginReady || !this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    return this.smsPlugin.stopWatch();
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
        console.log('SMS plugin initialized successfully');
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
}

export const smsService = SMSService.getInstance();
