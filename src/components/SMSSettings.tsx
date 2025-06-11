import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { parseMessage } from '@/utils/messageParser';
import { Transaction } from '@/types/Transaction';
import { TransactionCallback, SMSMessage } from '@/types/SMSTypes';

// Define the interface for the plugin based on its expected methods
interface SmsInboxPlugin {
  requestPermissions(): Promise<{ receive: string }>;
  checkPermissions(): Promise<{ receive: string }>;
  startWatching(): Promise<void>;
  stopWatching(): Promise<void>;
  addListener(eventName: 'smsReceived', listenerFunc: (info: SMSMessage) => void): Promise<any>;
}

// Register the plugin with Capacitor
const SmsInbox = registerPlugin<SmsInboxPlugin>('SmsInbox');

// --- Main SMSService ---
export class SMSService {
  private static instance: SMSService;
  private isListening = false;
  private smsListener?: any;
  private onTransactionDetected?: TransactionCallback;

  private constructor() {}

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }
  
  setTransactionCallback(callback: TransactionCallback) {
    this.onTransactionDetected = callback;
  }

  // --- Processor Logic (integrated directly) ---
  private processSMS(messageBody: string, sender: string) {
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

    const parsedTransaction = parseMessage(messageBody, true);
    
    if (parsedTransaction && this.onTransactionDetected) {
      toast({
        title: "Transaction Detected",
        description: `${parsedTransaction.type === 'income' ? 'Income' : 'Expense'} of ₹${parsedTransaction.amount} detected from SMS`,
      });
      this.onTransactionDetected(parsedTransaction);
    }
  }

  private simulateSMSForTesting() {
    const testSMS = "Your account has been debited by Rs 150.00 on 09-Jun-25 at Food Court via UPI. Available balance: Rs 4,850.00";
    this.processSMS(testSMS, "HDFC-BANK");
  }

  // --- Permission and Listener Logic ---
  async checkPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const result = await SmsInbox.checkPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('Error checking SMS permissions:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      toast({
          title: "SMS Detection Available on Mobile",
          description: "This feature works when the app is installed on an Android device.",
      });
      return false;
    }
    try {
      const result = await SmsInbox.requestPermissions();
      if (result.receive === 'granted') {
        toast({ title: "Permission Granted!" });
        return true;
      } else {
        toast({ title: "Permission Denied", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error('Error requesting SMS permissions:', error);
      toast({ title: "Permission Error", description: "Could not request permissions.", variant: "destructive" });
      return false;
    }
  }

  async startListening(): Promise<boolean> {
    if (this.isListening) return true;
    if (!Capacitor.isNativePlatform()) {
      this.simulateSMSForTesting();
      return true;
    }

    const hasPermission = await this.checkPermissions();
    if (!hasPermission) {
      const granted = await this.requestPermissions();
      if (!granted) return false;
    }

    try {
      await SmsInbox.startWatching();
      this.smsListener = await SmsInbox.addListener('smsReceived', (message) => {
        this.processSMS(message.body, message.address);
      });
      this.isListening = true;
      toast({ title: "SMS Detection Active" });
      return true;
    } catch (error) {
      console.error('Error starting SMS listener:', error);
      toast({ title: "Failed to Start Detection", variant: "destructive" });
      return false;
    }
  }

  stopListening() {
    if (!this.isListening) return;
    this.isListening = false;
    if (this.smsListener) {
      this.smsListener.remove();
      this.smsListener = null;
    }
    if (Capacitor.isNativePlatform()) {
      SmsInbox.stopWatching();
    }
    toast({ title: "SMS Detection Stopped" });
  }
  
  getListeningStatus(): boolean {
    return this.isListening;
  }
}

export const smsService = SMSService.getInstance();