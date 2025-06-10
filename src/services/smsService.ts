
import { Capacitor } from '@capacitor/core';
import { parseMessage } from '@/utils/messageParser';
import { Transaction } from '@/types/Transaction';
import { toast } from '@/hooks/use-toast';

// Define the SMS plugin interface for type safety
interface SmsPlugin {
  requestPermissions(): Promise<{ receive: string; send: string }>;
  checkPermissions(): Promise<{ receive: string; send: string }>;
  addListener(event: string, callback: (message: { body: string; address: string }) => void): Promise<any>;
}

export class SMSService {
  private static instance: SMSService;
  private isListening = false;
  private smsListener?: any;
  private smsPlugin?: SmsPlugin;
  private onTransactionDetected?: (transaction: Omit<Transaction, 'id' | 'date' | 'original_message'>) => void;

  private constructor() {
    this.initializeSMSPlugin();
  }

  private async initializeSMSPlugin() {
    if (Capacitor.isNativePlatform()) {
      try {
        // Try to dynamically import SMS plugin - this will fail gracefully if not available
        // For now, we'll comment this out until we have the correct plugin
        // const { Sms } = await import('@capacitor-community/sms');
        // this.smsPlugin = Sms;
        console.log('SMS plugin initialization skipped - plugin not available');
      } catch (error) {
        console.warn('SMS plugin not available:', error);
      }
    }
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        toast({
          title: "SMS Detection Available on Mobile",
          description: "SMS auto-detection works when the app is installed on Android/iOS devices.",
        });
        return false;
      }

      if (!this.smsPlugin) {
        await this.initializeSMSPlugin();
      }

      if (!this.smsPlugin) {
        toast({
          title: "SMS Plugin Setup Required",
          description: "SMS plugin needs to be configured for mobile builds. Enable test mode for now.",
          variant: "destructive",
        });
        return false;
      }

      // Request SMS permissions using the plugin
      const result = await this.smsPlugin.requestPermissions();
      
      if (result.receive === 'granted' && result.send === 'granted') {
        toast({
          title: "SMS Permission Granted",
          description: "The app can now detect transactions from SMS messages.",
        });
        return true;
      } else {
        toast({
          title: "SMS Permission Denied",
          description: "SMS permissions are required for automatic transaction detection.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      toast({
        title: "SMS Permission Error",
        description: "Could not request SMS permissions. Try again later.",
        variant: "destructive",
      });
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        return false;
      }

      if (!this.smsPlugin) {
        await this.initializeSMSPlugin();
      }

      if (!this.smsPlugin) {
        return false;
      }
      
      const result = await this.smsPlugin.checkPermissions();
      return result.receive === 'granted' && result.send === 'granted';
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return false;
    }
  }

  setTransactionCallback(callback: (transaction: Omit<Transaction, 'id' | 'date' | 'original_message'>) => void) {
    this.onTransactionDetected = callback;
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
      setTimeout(() => {
        this.simulateSMSForTesting();
      }, 3000);
      
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

    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return false;
    }

    try {
      // Set up SMS listener using the plugin
      this.smsListener = await this.smsPlugin.addListener('smsReceived', (message) => {
        console.log('SMS received:', message);
        this.processSMS(message.body, message.address);
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

  private simulateSMSForTesting() {
    // Simulate a bank SMS for testing purposes
    const testSMS = "Your account has been debited by Rs 150.00 on 09-Jun-25 at Food Court via UPI. Available balance: Rs 4,850.00";
    this.processSMS(testSMS, "HDFC-BANK");
  }

  private processSMS(messageBody: string, sender: string) {
    // Check if SMS is from bank or payment service
    const bankKeywords = [
      'bank', 'debit', 'credit', 'transaction', 'payment', 'transfer',
      'withdraw', 'deposit', 'balance', 'account', 'upi', 'paytm',
      'gpay', 'phonepe', 'amazon pay', 'razorpay', 'hdfc', 'sbi',
      'icici', 'axis', 'kotak', 'pnb', 'bob', 'canara', 'union'
    ];

    const isFromBank = bankKeywords.some(keyword => 
      messageBody.toLowerCase().includes(keyword) || 
      sender.toLowerCase().includes(keyword)
    );

    if (!isFromBank) return;

    console.log('Processing SMS from bank/payment service:', { messageBody, sender });

    // Parse the transaction from SMS
    const parsedTransaction = parseMessage(messageBody, true);
    
    if (parsedTransaction && this.onTransactionDetected) {
      // Show notification to user
      toast({
        title: "Transaction Detected",
        description: `${parsedTransaction.type === 'income' ? 'Income' : 'Expense'} of ₹${parsedTransaction.amount} detected from SMS`,
      });

      // Call the callback to add transaction
      this.onTransactionDetected(parsedTransaction);
    }
  }

  getListeningStatus(): boolean {
    return this.isListening;
  }
}

export const smsService = SMSService.getInstance();
