
import { Capacitor } from '@capacitor/core';
import { TransactionCallback, SmsPlugin } from '@/types/SMSTypes';
import { SMSPermissionManager } from './sms/SMSPermissionManager';
import { SMSProcessor } from './sms/SMSProcessor';
import { SMSListenerManager } from './sms/SMSListenerManager';
import { SMSPluginDetector } from './sms/SMSPluginDetector';

// Wrapper for SMS plugins to normalize their interfaces
class SmsPluginWrapper implements SmsPlugin {
  private smsPlugin: any = null;
  private initialized = false;
  private detector: SMSPluginDetector;

  constructor() {
    this.detector = SMSPluginDetector.getInstance();
  }

  private async initializePlugin(): Promise<void> {
    if (this.initialized) return;
    
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping SMS plugin initialization');
      this.initialized = true;
      return;
    }
    
    try {
      console.log('=== INITIALIZING SMS PLUGIN ===');
      this.detector.logAvailableCapacitorInfo();
      
      this.smsPlugin = await this.detector.detectAndLoadSMSPlugin();
      
      if (this.smsPlugin) {
        console.log('✓ SMS plugin loaded successfully');
      } else {
        console.log('❌ SMS plugin not found');
      }
    } catch (error) {
      console.error('Failed to load SMS plugin:', error);
      this.smsPlugin = null;
    } finally {
      this.initialized = true;
    }
  }

  async requestPermissions() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      console.log('❌ SMS plugin not available for permission request');
      return { receive: 'denied', send: 'denied' };
    }
    
    try {
      const result = await this.smsPlugin.requestPermissions();
      console.log('Permission request result:', result);
      return this.parseResult(result);
    } catch (error) {
      console.error('❌ Error requesting SMS permissions:', error);
      return { receive: 'denied', send: 'denied' };
    }
  }

  async checkPermissions() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      console.log('❌ SMS plugin not available for permission check');
      return { receive: 'denied', send: 'denied' };
    }

    try {
      const result = await this.smsPlugin.checkPermissions();
      console.log('Permission check result:', result);
      return this.parseResult(result);
    } catch (error) {
      console.error('❌ Error checking SMS permissions:', error);
      return { receive: 'denied', send: 'denied' };
    }
  }

  private parseResult(result: any): { receive: string; send: string } {
    if (!result) return { receive: 'denied', send: 'denied' };
    
    // Handle different result formats
    if (result.receive !== undefined && result.send !== undefined) {
      return { receive: result.receive, send: result.send };
    }
    
    // Handle boolean results
    if (typeof result === 'boolean') {
      const status = result ? 'granted' : 'denied';
      return { receive: status, send: status };
    }
    
    // Handle nested permissions
    if (result.permissions) {
      return {
        receive: result.permissions.receive || 'denied',
        send: result.permissions.send || 'denied'
      };
    }
    
    // For plugins that return different formats
    if (result.granted !== undefined) {
      const status = result.granted ? 'granted' : 'denied';
      return { receive: status, send: status };
    }
    
    return { receive: 'denied', send: 'denied' };
  }

  async addListener(event: string, callback: (message: { body: string; address: string }) => void) {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    
    return await this.smsPlugin.addListener(event, callback);
  }

  async startWatching() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    
    if (typeof this.smsPlugin.startWatching === 'function') {
      return await this.smsPlugin.startWatching();
    }
    
    console.log('No startWatching method, SMS should work automatically');
    return Promise.resolve();
  }

  async stopWatching() {
    await this.initializePlugin();
    
    if (!this.smsPlugin) {
      throw new Error('SMS plugin not available');
    }
    
    if (typeof this.smsPlugin.stopWatching === 'function') {
      return await this.smsPlugin.stopWatching();
    }
    
    console.log('No stopWatching method');
    return Promise.resolve();
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
        this.smsPlugin = new SmsPluginWrapper();
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
}

export const smsService = SMSService.getInstance();
