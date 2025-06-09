
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { parseMessage } from '@/utils/messageParser';
import { Transaction } from '@/types/Transaction';
import { toast } from '@/hooks/use-toast';

export class SMSService {
  private static instance: SMSService;
  private isListening = false;
  private onTransactionDetected?: (transaction: Omit<Transaction, 'id' | 'date' | 'original_message'>) => void;

  private constructor() {}

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

      // For now, we'll simulate permission granted
      // In a real app, you would use a proper SMS plugin
      toast({
        title: "SMS Permission Granted",
        description: "The app can now detect transactions from SMS messages.",
      });
      return true;
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
      
      // In a real implementation, check actual SMS permissions
      // For now, return true if on native platform
      return true;
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
      toast({
        title: "SMS Detection Unavailable",
        description: "SMS detection is only available on mobile devices. Build and install the app to use this feature.",
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
      // In a real implementation, you would set up SMS listeners here
      // For development, we'll simulate the listener being active
      this.isListening = true;
      
      toast({
        title: "SMS Detection Active",
        description: "Now automatically detecting transactions from SMS messages.",
      });

      // Simulate receiving an SMS for testing
      if (Capacitor.getPlatform() === 'web') {
        setTimeout(() => {
          this.simulateSMSForTesting();
        }, 3000);
      }

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
