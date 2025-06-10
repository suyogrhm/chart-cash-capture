
import { Transaction } from '@/types/Transaction';

export interface SmsPlugin {
  checkPermissions(): Promise<{ receive: string; send: string }>;
  requestPermissions(): Promise<{ receive: string; send: string }>;
  addListener(event: string, callback: (message: { body: string; address: string }) => void): Promise<any>;
  startWatching?(): Promise<void>;
  stopWatching?(): Promise<void>;
  getMessages?(options?: any): Promise<any>;
}

export interface SMSMessage {
  body: string;
  address: string;
}

export type TransactionCallback = (transaction: Omit<Transaction, 'id' | 'date' | 'original_message'>) => void;

export interface SMSPermissionResult {
  receive: string;
  send: string;
}
