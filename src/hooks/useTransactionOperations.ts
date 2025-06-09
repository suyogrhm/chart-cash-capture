
import { Transaction } from '@/types/Transaction';
import { parseMessage } from '@/utils/messageParser';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useTransactionOperations = (
  transactions: Transaction[],
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
  accounts: any[]
) => {
  const { user } = useAuth();

  const handleMessage = async (message: string, accountId?: string, paymentMethod?: string) => {
    if (!user) return;

    const parsedTransaction = parseMessage(message);
    if (parsedTransaction) {
      // Handle payment method - if empty string, set to null
      const validPaymentMethod = paymentMethod && paymentMethod.trim() !== '' ? paymentMethod : null;
      
      // Find default account (prioritize savings, then first available)
      const defaultAccount = accounts.find(acc => acc.type === 'savings') || accounts[0];
      
      const newTransaction = {
        ...parsedTransaction,
        user_id: user.id,
        original_message: message,
        account_id: accountId || defaultAccount?.id,
        payment_method: validPaymentMethod as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other' | null
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select()
        .single();

      if (error) {
        console.error('Transaction error:', error);
        toast({
          title: "Error",
          description: "Failed to add transaction",
          variant: "destructive",
        });
      } else if (data) {
        setTransactions(prev => [data as Transaction, ...prev]);
        toast({
          title: "Transaction added",
          description: `Added ${parsedTransaction.type} of $${parsedTransaction.amount}`,
        });
      }
    }
  };

  const handleEditTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    } else {
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed from your records.",
      });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense-tracker-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your transaction data has been downloaded as a JSON file.",
    });
  };

  return {
    handleMessage,
    handleEditTransaction,
    handleDeleteTransaction,
    handleExportData,
  };
};
