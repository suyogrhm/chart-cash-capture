
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  original_message?: string;
  account_id?: string;
  payment_method?: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_due_date?: string;
  attachments?: string[];
  tags?: string[];
  user_id?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  user_id?: string;
  created_at?: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'cash';
  balance: number;
  color: string;
  user_id?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  spent: number;
  user_id?: string;
  created_at?: string;
}
