
import { parseMessage } from '@/utils/messageParser';
import { toast } from '@/hooks/use-toast';
import { TransactionCallback } from '@/types/SMSTypes';

export class SMSProcessor {
  private onTransactionDetected?: TransactionCallback;

  setTransactionCallback(callback: TransactionCallback) {
    this.onTransactionDetected = callback;
  }

  simulateSMSForTesting() {
    const testSMS = "Your account has been debited by Rs 150.00 on 09-Jun-25 at Food Court via UPI. Available balance: Rs 4,850.00";
    this.processSMS(testSMS, "HDFC-BANK");
  }

  processSMS(messageBody: string, sender: string) {
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
}
