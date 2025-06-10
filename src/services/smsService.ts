
import { Capacitor } from '@capacitor/core';
import { SmsManager } from 'capacitor-sms';
import { TransactionCallback, SmsPlugin } from '@/types/SMSTypes';
import { SMSPermissionManager } from './sms/SMSPermissionManager';
import { SMSProcessor } from './sms/SMSProcessor';
import { SMSListenerManager } from './sms/SMSListenerManager';

// Create a wrapper that implements our SmsPlugin interface
class CapacitorSmsWrapper implements SmsPlugin {
  async requestPermissions() {
    try {
      const result = await SmsManager.requestPermissions();
      return {
        receive: result.granted ? 'granted' : 'denied',
        send: result.granted ? 'granted' : 'denied'
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
    try {
      const result = await SmsManager.checkPermissions();
      return {
        receive: result.granted ? 'granted' : 'denied',
        send: result.granted ? 'granted' : 'denied'
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
    return SmsManager.addListener('smsReceived', callback);
  }

  async startWatching() {
    return SmsManager.startWatch();
  }

  async stopWatching() {
    return SmsManager.stopWatch();
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
