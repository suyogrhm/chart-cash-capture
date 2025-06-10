import { Capacitor } from '@capacitor/core';
import { TransactionCallback, SmsPlugin } from '@/types/SMSTypes';
import { SMSPermissionManager } from './sms/SMSPermissionManager';
import { SMSProcessor } from './sms/SMSProcessor';
import { SMSListenerManager } from './sms/SMSListenerManager';

// Mock implementation for web and runtime plugin loading for native
class CapacitorSmsWrapper implements SmsPlugin {
  private smsPlugin: any = null;
  private initialized = false;

  constructor() {
    // Don't initialize immediately to avoid build issues
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    
    this.initialized = true;
    
    if (Capacitor.isNativePlatform()) {
      try {
        // Use eval-based dynamic import to completely avoid static analysis
        const importFunction = new Function('specifier', 'return import(specifier)');
        const smsModule = await importFunction('capacitor-sms').catch(() => null);
        
        if (smsModule) {
          this.smsPlugin = smsModule.default || smsModule.SmsManager || smsModule;
          console.log('SMS plugin loaded:', !!this.smsPlugin);
        } else {
          console.warn('SMS plugin not available');
        }
      } catch (error) {
        console.warn('Failed to load SMS plugin:', error);
        this.smsPlugin = null;
      }
    }
  }

  async requestPermissions() {
    await this.ensureInitialized();
    
    try {
      if (!this.smsPlugin) {
        console.log('No SMS plugin available for permission request');
        return { receive: 'denied', send: 'denied' };
      }
      
      console.log('Requesting permissions via SMS plugin...');
      const result = await this.smsPlugin.requestPermissions();
      console.log('Raw permission request result:', JSON.stringify(result, null, 2));
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));
      
      // Handle the actual capacitor-sms plugin response format
      if (result && typeof result === 'object') {
        // Check for direct receive/send properties
        if (result.receive !== undefined && result.send !== undefined) {
          console.log('Found receive/send properties:', { receive: result.receive, send: result.send });
          return {
            receive: result.receive,
            send: result.send
          };
        }
        
        // Check for nested permissions object
        if (result.permissions) {
          console.log('Found nested permissions:', result.permissions);
          return {
            receive: result.permissions.receive || 'denied',
            send: result.permissions.send || 'denied'
          };
        }
        
        // Check for granted boolean (legacy format)
        if (typeof result.granted === 'boolean') {
          const status = result.granted ? 'granted' : 'denied';
          console.log('Found granted boolean:', result.granted, 'status:', status);
          return {
            receive: status,
            send: status
          };
        }
        
        // Check for status property
        if (result.status) {
          const status = result.status === 'granted' ? 'granted' : 'denied';
          console.log('Found status property:', result.status, 'parsed:', status);
          return {
            receive: status,
            send: status
          };
        }
      }
      
      // Handle boolean response directly
      if (typeof result === 'boolean') {
        const status = result ? 'granted' : 'denied';
        console.log('Boolean result:', result, 'status:', status);
        return {
          receive: status,
          send: status
        };
      }
      
      // Fallback for unexpected response format
      console.warn('Unexpected permission request response format:', result);
      return {
        receive: 'denied',
        send: 'denied'
      };
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      return {
        receive: 'denied',
        send: 'denied'
      };
    }
  }

  async checkPermissions() {
    await this.ensureInitialized();
    
    try {
      if (!this.smsPlugin) {
        console.log('No SMS plugin available for permission check');
        return { receive: 'denied', send: 'denied' };
      }

      console.log('Checking permissions via SMS plugin...');
      const result = await this.smsPlugin.checkPermissions();
      console.log('Raw permission check result:', JSON.stringify(result, null, 2));
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));
      
      // Handle the actual capacitor-sms plugin response format
      if (result && typeof result === 'object') {
        // Check for direct receive/send properties
        if (result.receive !== undefined && result.send !== undefined) {
          console.log('Found receive/send properties:', { receive: result.receive, send: result.send });
          return {
            receive: result.receive,
            send: result.send
          };
        }
        
        // Check for nested permissions object
        if (result.permissions) {
          console.log('Found nested permissions:', result.permissions);
          return {
            receive: result.permissions.receive || 'denied',
            send: result.permissions.send || 'denied'
          };
        }
        
        // Check for granted boolean (legacy format)
        if (typeof result.granted === 'boolean') {
          const status = result.granted ? 'granted' : 'denied';
          console.log('Found granted boolean:', result.granted, 'status:', status);
          return {
            receive: status,
            send: status
          };
        }
        
        // Check for status property
        if (result.status) {
          const status = result.status === 'granted' ? 'granted' : 'denied';
          console.log('Found status property:', result.status, 'parsed:', status);
          return {
            receive: status,
            send: status
          };
        }
        
        // Check for individual permission properties that might be boolean
        if (result.readSms !== undefined || result.receiveSms !== undefined) {
          const receiveStatus = (result.readSms || result.receiveSms) ? 'granted' : 'denied';
          const sendStatus = result.sendSms ? 'granted' : 'denied';
          console.log('Found individual SMS permissions:', { readSms: result.readSms, receiveSms: result.receiveSms, sendSms: result.sendSms });
          return {
            receive: receiveStatus,
            send: sendStatus
          };
        }
      }
      
      // Handle boolean response directly
      if (typeof result === 'boolean') {
        const status = result ? 'granted' : 'denied';
        console.log('Boolean result:', result, 'status:', status);
        return {
          receive: status,
          send: status
        };
      }
      
      // Fallback for unexpected response format
      console.warn('Unexpected permission check response format:', result);
      console.warn('Available properties:', Object.keys(result || {}));
      return {
        receive: 'denied',
        send: 'denied'
      };
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return {
        receive: 'denied',
        send: 'denied'
      };
    }
  }

  async addListener(event: string, callback: (message: { body: string; address: string }) => void) {
    await this.ensureInitialized();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    return this.smsPlugin.addListener('smsReceived', callback);
  }

  async startWatching() {
    await this.ensureInitialized();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    return this.smsPlugin.startWatch();
  }

  async stopWatching() {
    await this.ensureInitialized();
    
    if (!this.smsPlugin) {
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
