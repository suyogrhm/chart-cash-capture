
import { SMS } from '@capacitor/sms';
import { Permissions } from '@capacitor/permissions';
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
      const result = await Permissions.requestPermissions({
        permissions: ['sms']
      });
      
      if (result.sms === 'granted') {
        toast({
          title: "SMS Permission Granted",
          description: "The app can now detect transactions from SMS messages.",
        });
        return true;
      } else {
        toast({
          title: "SMS Permission Denied",
          description: "Please enable SMS permission in settings to auto-detect transactions.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await Permissions.checkPermissions();
      return result.sms === 'granted';
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

    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return false;
    }

    try {
      // Start listening for SMS messages
      await SMS.addListener('smsReceived', (message) => {
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

    SMS.removeAllListeners();
    this.isListening = false;
    toast({
      title: "SMS Detection Stopped",
      description: "No longer detecting transactions from SMS messages.",
    });
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
    const parsedTransaction = parseMessage(messageBody);
    
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
