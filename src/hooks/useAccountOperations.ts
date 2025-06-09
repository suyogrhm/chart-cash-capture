
import { Account } from '@/types/Transaction';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAccountOperations = (
  accounts: Account[],
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>
) => {
  const { user } = useAuth();

  const handleAddAccount = async (account: Omit<Account, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('accounts')
      .insert({ ...account, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add account",
        variant: "destructive",
      });
    } else if (data) {
      setAccounts(prev => [...prev, data as Account]);
      toast({
        title: "Account added",
        description: `${account.name} has been added to your accounts.`,
      });
    }
  };

  const handleEditAccount = async (id: string, updates: Partial<Account>) => {
    const { error } = await supabase
      .from('accounts')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    } else {
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } else {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  return {
    handleAddAccount,
    handleEditAccount,
    handleDeleteAccount,
  };
};
