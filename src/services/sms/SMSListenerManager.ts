
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { SmsPlugin } from '@/types/SMSTypes';
import { SMSProcessor } from './SMSProcessor';

export class SMSListenerManager {
  private isListening = false;
  private smsListener?: any;
  private smsPlugin?: SmsPlugin;
  private processor?: SMSProcessor;

  constructor(smsPlugin?: SmsPlugin, processor?: SMSProcessor) {
    this.smsPlugin = smsPlugin;
    this.processor = processor;
  }

  async startListening(): Promise<boolean> {
    if (this.isListening) return true;

    if (!Capacitor.isNativePlatform()) {
      // For web preview, show info and enable test mode
      toast({
        title: "SMS Detection Test Mode",
        description: "Testing SMS detection with a simulated transaction. Install on mobile for real SMS detection.",
      });
      
      this.isListening = true;
      
      // Simulate receiving an SMS for testing in web mode
      if (this.processor) {
        setTimeout(() => {
          this.processor!.simulateSMSForTesting();
        }, 3000);
      }
      
      return true;
    }

    // For native platforms, check if we have the plugin
    if (!this.smsPlugin) {
      toast({
        title: "SMS Plugin Required",
        description: "SMS plugin needs to be installed for mobile builds. Contact developer for setup.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Set up SMS listener using the plugin
      this.smsListener = await this.smsPlugin.addListener('smsReceived', (message) => {
        console.log('SMS received:', message);
        if (this.processor) {
          this.processor.processSMS(message.body, message.address);
        }
      });

      this.isListening = true;
      
      toast({
        title: "SMS Detection Active",
        description: "Now automatically detecting transactions from SMS messages.",
      });

      return true;
    } catch (error) {
      console.error('Error starting SMS listener:', error);
      toast({
        title: "SMS Detection Failed",
        description: "Could not start SMS detection. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }

  stopListening() {
    if (!this.isListening) return;

    if (this.smsListener) {
      this.smsListener.remove();
      this.smsListener = null;
    }

    this.isListening = false;
    toast({
      title: "SMS Detection Stopped",
      description: "No longer detecting transactions from SMS messages.",
    });
  }

  getListeningStatus(): boolean {
    return this.isListening;
  }
}
